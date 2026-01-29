use anyhow::Result;
use axum::{
    routing::post,
    extract::{State, Json},
    http::StatusCode,
    Router,
};
use identity_eddsa_verifier::EdDSAJwsVerifier;
use identity_iota::{
    core::{Duration, FromJson, Object, Timestamp, ToJson, Url},
    credential::{
        Credential, CredentialBuilder, DecodedJwtCredential, DecodedJwtPresentation, FailFast, Jwt, 
        JwtCredentialValidationOptions, JwtCredentialValidator, JwtPresentationOptions, 
        JwtPresentationValidationOptions, JwtPresentationValidator, JwtPresentationValidatorUtils, 
        Presentation, PresentationBuilder, Subject, SubjectHolderRelationship
    },
    did::{CoreDID, DID},
    document::verifiable::JwsVerificationOptions,
    iota::IotaDocument,
    resolver::Resolver,
};
use identity_storage::{JwkDocumentExt, JwsSignatureOptions};
use identity_logic::{create_did_document, get_stronghold_storage, get_funded_client, get_read_only_client};
use serde::{Deserialize, Serialize};
use std::{fs, path::PathBuf, collections::HashMap, sync::Arc};

// --- Data Structures ---

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RequestBody { 
    package_id: String, 
    vc_jwt: Option<String>, 
    vp_jwt: Option<String> 
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ApiResponse { 
    did: Option<String>, 
    jwt: Option<String>, 
    success: Option<bool>, 
    output: Option<String> 
}

// --- Helper: Create or Load DID ---

async fn create_or_load_did(
    doc_file: &str,
    fragment_file: &str,
    stronghold_path: &str,
) -> Result<(IotaDocument, String)> {
    let storage = get_stronghold_storage(Some(PathBuf::from(stronghold_path)))?;

    if !PathBuf::from(doc_file).exists() {
        let client = get_funded_client(&storage).await?;
        let (doc, frag) = create_did_document(&client, &storage).await?;
        fs::write(doc_file, doc.to_json()?)?;
        fs::write(fragment_file, &frag)?;
        Ok((doc, frag))
    } else {
        let doc_json = fs::read_to_string(doc_file)?;
        let doc = IotaDocument::from_json(&doc_json)?;
        let frag = fs::read_to_string(fragment_file)?.trim().to_string();
        Ok((doc, frag))
    }
}

// --- API Handlers (The Solution) ---

/// STEP 1: Logistics Provider (Holder) initializes their identity
async fn logistics_provider_create_did() -> Result<Json<ApiResponse>, StatusCode> {
    let (doc, _) = create_or_load_did(
        "./logistics_doc.json",
        "./logistics_fragment.txt",
        "./logistics.stronghold"
    ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse {
        did: Some(doc.id().to_string()),
        jwt: None, success: None, output: None,
    }))
}

/// STEP 2: Manufacturer (Issuer) issues a "Product Origin" VC to the Logistics Provider
async fn manufacturer_issue_origin_vc(Json(body): Json<RequestBody>) -> Result<Json<ApiResponse>, StatusCode> {
    // 1. Setup Manufacturer (Issuer)
    let (issuer_doc, issuer_fragment) = create_or_load_did(
        "./manufacturer_doc.json",
        "./manufacturer_fragment.txt",
        "./manufacturer.stronghold",
    ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 2. Load Logistics Provider (Holder) DID
    let holder_doc_json = fs::read_to_string("./logistics_doc.json").map_err(|_| StatusCode::NOT_FOUND)?;
    let holder_doc = IotaDocument::from_json(&holder_doc_json).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 3. Build Credential Subject (The package details)
    let subject = Subject::from_json_value(serde_json::json!({
        "id": holder_doc.id().as_str(),
        "productID": body.package_id,
        "factoryOrigin": "Berlin_Smart_Factory_01",
        "productionDate": Timestamp::now_utc().to_rfc3339()
    })).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let credential: Credential<Object> = CredentialBuilder::default()
        .id(Url::parse("https://supply-chain.iota/credentials/origin-123").unwrap())
        .issuer(Url::parse(issuer_doc.id().as_str()).unwrap())
        .type_("ProductOriginCredential")
        .subject(subject)
        .build().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 4. Sign VC
    let issuer_storage = get_stronghold_storage(Some(PathBuf::from("./manufacturer.stronghold")))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let credential_jwt = issuer_doc
        .create_credential_jwt(
            &credential,
            &issuer_storage,
            &issuer_fragment,
            &JwsSignatureOptions::default(),
            None,
        ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse {
        did: None,
        jwt: Some(credential_jwt.as_str().to_string()),
        success: None, output: None,
    }))
}

/// STEP 3: Logistics Provider (Holder) creates a Presentation for the Retailer
async fn logistics_create_delivery_vp(Json(body): Json<RequestBody>) -> Result<Json<ApiResponse>, StatusCode> {
    let vc_jwt = body.vc_jwt.ok_or(StatusCode::BAD_REQUEST)?;
    let stronghold_path = "./logistics.stronghold";

    let (holder_doc, holder_fragment) = create_or_load_did(
        "./logistics_doc.json",
        "./logistics_fragment.txt",
        stronghold_path,
    ).await.map_err(|_| StatusCode::NOT_FOUND)?;

    let holder_storage = get_stronghold_storage(Some(PathBuf::from(stronghold_path)))
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    // Presentation metadata
    let challenge = "retailer-auth-nonce-999";
    let expires = Timestamp::now_utc().checked_add(Duration::minutes(30)).unwrap();
    
    // Build and Sign VP
    let presentation: Presentation<Jwt> = PresentationBuilder::new(
        holder_doc.id().to_url().into(), 
        Default::default()
    )
    .credential(Jwt::new(vc_jwt))
    .build().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let vp_jwt = holder_doc
        .create_presentation_jwt(
            &presentation,
            &holder_storage,
            &holder_fragment,
            &JwsSignatureOptions::default().nonce(challenge.to_owned()),
            &JwtPresentationOptions::default().expiration_date(expires),
        ).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(ApiResponse {
        did: None,
        jwt: Some(vp_jwt.as_str().to_string()),
        success: None, output: None,
    }))
}

/// STEP 4: Retailer (Verifier) validates the package origin
async fn retailer_verify_delivery(Json(body): Json<RequestBody>) -> Result<Json<ApiResponse>, StatusCode> {
    let vp_jwt = Jwt::new(body.vp_jwt.ok_or(StatusCode::BAD_REQUEST)?);
    let challenge = "retailer-auth-nonce-999";
    let mut log = String::new();

    // 1. Setup Resolver
    let verifier_client = get_read_only_client().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut resolver: Resolver<IotaDocument> = Resolver::new();
    resolver.attach_iota_handler(verifier_client);

    // 2. Resolve Holder (Logistics Provider)
    let holder_did: CoreDID = JwtPresentationValidatorUtils::extract_holder(&vp_jwt).map_err(|_| StatusCode::BAD_REQUEST)?;
    let holder_doc = resolver.resolve(&holder_did).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 3. Validate VP
    let vp_validation_options = JwtPresentationValidationOptions::default()
        .presentation_verifier_options(JwsVerificationOptions::default().nonce(challenge.to_owned()));
    
    let decoded_vp = JwtPresentationValidator::with_signature_verifier(EdDSAJwsVerifier::default())
        .validate(&vp_jwt, &holder_doc, &vp_validation_options)
        .map_err(|_| StatusCode::BAD_REQUEST)?;

    log.push_str("✅ Delivery Proof (VP) verified.\n");

    // 4. Validate Credentials (VCs from Manufacturer)
    let jwt_credentials = &decoded_vp.presentation.verifiable_credential;
    let issuers: Vec<CoreDID> = jwt_credentials.iter()
        .map(|jwt| identity_iota::credential::JwtCredentialValidatorUtils::extract_issuer_from_jwt(jwt))
        .collect::<Result<Vec<CoreDID>, _>>().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let issuers_documents = resolver.resolve_multiple(&issuers).await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let credential_validator = JwtCredentialValidator::with_signature_verifier(EdDSAJwsVerifier::default());
    let credential_validation_options = JwtCredentialValidationOptions::default()
        .subject_holder_relationship(holder_did.to_url().into(), SubjectHolderRelationship::AlwaysSubject);

    for (index, jwt_vc) in jwt_credentials.iter().enumerate() {
        let issuer_doc = &issuers_documents[&issuers[index]];
        credential_validator.validate(jwt_vc, issuer_doc, &credential_validation_options, FailFast::FirstError)
            .map_err(|_| StatusCode::BAD_REQUEST)?;
        log.push_str(&format!("✅ Origin Certificate [{}] verified from Manufacturer: {}\n", index + 1, issuer_doc.id()));
    }

    Ok(Json(ApiResponse {
        did: None, jwt: None,
        success: Some(true),
        output: Some(log),
    }))
}

// --- Main ---

#[tokio::main]
async fn main() -> Result<()> {
    // Ensure IOTA_IDENTITY_PKG_ID is set in the environment
    let app = Router::new()
        .route("/api/supply-chain/logistics/create-did", post(logistics_provider_create_did))
        .route("/api/supply-chain/manufacturer/issue", post(manufacturer_issue_origin_vc))
        .route("/api/supply-chain/logistics/present", post(logistics_create_delivery_vp))
        .route("/api/supply-chain/retailer/verify", post(retailer_verify_delivery));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3002").await?;
    println!("🚀 Supply Chain Solution running on http://0.0.0.0:3002");
    axum::serve(listener, app.into_make_service()).await?;
    Ok(())
}