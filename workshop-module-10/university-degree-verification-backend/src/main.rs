use anyhow::Result;
use axum::{
    routing::{post},
    extract::{State, Json},
    http::StatusCode,
    Router,
};
use identity_eddsa_verifier::EdDSAJwsVerifier;
use identity_iota::{
    core::{Duration, FromJson, Object, Timestamp, ToJson, Url},
    credential::{
        Credential, CredentialBuilder, DecodedJwtCredential, DecodedJwtPresentation, FailFast, Jwt, JwtCredentialValidationOptions, JwtCredentialValidator, JwtPresentationOptions, JwtPresentationValidationOptions, JwtPresentationValidator, JwtPresentationValidatorUtils, Presentation, PresentationBuilder, Subject, SubjectHolderRelationship
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


// --- Data Structures for API Communication ---

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct PackageId {
    package_id: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VcJwt {
    package_id: String,
    vc_jwt: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct VpJwt {
    package_id: String,
    vp_jwt: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct DidResponse {
    did: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct JwtResponse {
    jwt: String,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ValidationResponse {
    success: bool,
    output: String,
}


// Helper function to create or load a DID document and its signing fragment
async fn create_or_load_did(
    doc_file: &str,
    fragment_file: &str,
    stronghold_path: &str,
) -> Result<(IotaDocument, String)> {
    let storage = get_stronghold_storage(Some(PathBuf::from(stronghold_path)))?;

    if !PathBuf::from(doc_file).exists() {
        let client = get_funded_client(&storage).await?;
        let (doc, frag) = create_did_document(&client, &storage).await?;
        
        // Save to disk for persistence between server restarts
        fs::write(doc_file, doc.to_json()?)?;
        fs::write(fragment_file, &frag)?;

        println!(">> Created DID: {}", doc.id());
        Ok((doc, frag))
    } else {
        let doc_json = fs::read_to_string(doc_file)?;
        let doc = IotaDocument::from_json(&doc_json)?;
        let frag = fs::read_to_string(fragment_file)?.trim().to_string();
        
        println!(">> Loaded DID: {}", doc.id());
        Ok((doc, frag))
    }
}

// --- API Handlers ---

// Step 1: Holder creates their DID (runs only once per holder.stronghold file)
async fn holder_create_did(Json(_body): Json<PackageId>) -> Result<Json<DidResponse>, StatusCode> {
    let holder_doc_file = "./holder_doc.json";
    let holder_fragment_file = "./holder_fragment.txt";
    let stronghold_path = "./holder.stronghold";

    // This calls create_or_load_did. If the file exists, it loads the existing DID.
    // The DID is anchored and funded if newly created.
    let (holder_doc, _) = create_or_load_did(
        holder_doc_file,
        holder_fragment_file,
        stronghold_path
    ).await.map_err(|e| {
        eprintln!("Error creating holder DID: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(DidResponse {
        did: holder_doc.id().to_string(),
    }))
}

// Step 2: Issuer creates DID (if needed) and issues a VC to the Holder
async fn issuer_issue_vc(Json(_body): Json<PackageId>) -> Result<Json<JwtResponse>, StatusCode> {
    let issuer_doc_file = "./issuer_doc.json";
    let issuer_fragment_file = "./issuer_fragment.txt";
    let issuer_stronghold_path = "./issuer.stronghold";

    // 1. Create/Load Issuer DID
    let (issuer_doc, issuer_fragment) = create_or_load_did(
        issuer_doc_file,
        issuer_fragment_file,
        issuer_stronghold_path,
    ).await.map_err(|e| {
        eprintln!("Error creating issuer DID: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // 2. Load Holder DID (must exist from Step 1)
    let holder_doc_json = fs::read_to_string("./holder_doc.json").map_err(|_| StatusCode::NOT_FOUND)?;
    let holder_doc = IotaDocument::from_json(&holder_doc_json).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 3. Build VC
    let subject = Subject::from_json_value(serde_json::json!({
        "id": holder_doc.id().as_str(),
        "name": "Alice",
        "degree": { "type": "BachelorDegree", "name": "Bachelor of Science and Arts" },
        "GPA": "4.0"
    })).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let credential: Credential<Object> = CredentialBuilder::default() // Type Annotation Fix
        .id(Url::parse("https://example.edu/credentials/3732").map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?)
        .issuer(Url::parse(issuer_doc.id().as_str()).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?)
        .type_("UniversityDegreeCredential")
        .subject(subject)
        .build().map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    // 4. Sign VC
    let issuer_storage = get_stronghold_storage(Some(PathBuf::from(issuer_stronghold_path))).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let credential_jwt = issuer_doc
        .create_credential_jwt(
            &credential,
            &issuer_storage,
            &issuer_fragment,
            &JwsSignatureOptions::default(),
            None,
        )
        .await
        .map_err(|e| {
            eprintln!("Error signing VC: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;
    
    // Return VC JWT string
    Ok(Json(JwtResponse {
        jwt: credential_jwt.as_str().to_string(),
    }))
}

// Step 3: Holder creates a Verifiable Presentation (VP)
async fn holder_create_vp(Json(body): Json<VcJwt>) -> Result<Json<JwtResponse>, StatusCode> {
    let stronghold_path = "./holder.stronghold";
    let holder_doc_file = "./holder_doc.json";
    let holder_fragment_file = "./holder_fragment.txt";

    // 1. Load Holder DID
    let (holder_doc, holder_fragment) = create_or_load_did(
        holder_doc_file,
        holder_fragment_file,
        stronghold_path,
    ).await.map_err(|_| StatusCode::NOT_FOUND)?; 

    let holder_storage = get_stronghold_storage(Some(PathBuf::from(stronghold_path))).map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let challenge = "challenge-123";
    let expires = Timestamp::now_utc().checked_add(Duration::minutes(10)).unwrap();
    
    // 2. Build VP
    let presentation: Presentation<Jwt> = PresentationBuilder::new( // Type Annotation Fix
        holder_doc.id().to_url().into(), 
        Default::default()) // Explicit default
        .credential(Jwt::new(body.vc_jwt))
        .build().map_err(|e| {
            eprintln!("Error building presentation: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // 3. Sign VP
    let vp_jwt: Jwt = holder_doc
        .create_presentation_jwt(
            &presentation,
            &holder_storage,
            &holder_fragment,
            &JwsSignatureOptions::default().nonce(challenge.to_owned()),
            &JwtPresentationOptions::default().expiration_date(expires),
        )
        .await
        .map_err(|e| {
            eprintln!("Error signing VP: {:?}", e);
            StatusCode::INTERNAL_SERVER_ERROR
        })?;

    // Return VP JWT string
    Ok(Json(JwtResponse {
        jwt: vp_jwt.as_str().to_string(),
    }))
}

// Step 4: Verifier validates the VP and embedded VC
async fn verifier_validate(Json(body): Json<VpJwt>) -> Result<Json<ValidationResponse>, StatusCode> {
    let vp_jwt = Jwt::new(body.vp_jwt);
    let challenge = "challenge-123";
    let mut output = String::new();

    // 1. Setup Resolver and Read-Only Client
    let verifier_client = get_read_only_client().await.map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    let mut resolver: Resolver<IotaDocument> = Resolver::new();
    resolver.attach_iota_handler(verifier_client);

    let presentation_verifier_options = JwsVerificationOptions::default().nonce(challenge.to_owned());
    output.push_str(&format!("🔍 Using challenge: {}\n", challenge));

    // 2. Resolve Holder DID
    let holder_did: CoreDID = JwtPresentationValidatorUtils::extract_holder(&vp_jwt)
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    output.push_str(&format!("🔑 Extracted holder DID from VP: {}\n", holder_did));
    
    let holder_doc: IotaDocument = resolver.resolve(&holder_did).await.map_err(|e| {
        output.push_str(&format!("❌ Failed to resolve holder DID: {:?}\n", e));
        StatusCode::INTERNAL_SERVER_ERROR
    })?;
    output.push_str(&format!("✅ Resolved holder DID from network: {}\n", holder_doc.id()));

    // 3. Validate VP Signature and Challenge
    let vp_validation_options = JwtPresentationValidationOptions::default()
        .presentation_verifier_options(presentation_verifier_options);
    
    let decoded_vp: DecodedJwtPresentation<Jwt> = JwtPresentationValidator::with_signature_verifier(EdDSAJwsVerifier::default())
        .validate(&vp_jwt, &holder_doc, &vp_validation_options)
        .map_err(|e| {
            output.push_str(&format!("❌ VP Validation Failed: {:?}\n", e));
            StatusCode::BAD_REQUEST
        })?;
    
    output.push_str("✅ VP JWT verified successfully\n");
    output.push_str(&format!("✅ VP Holder matches Subject: {}\n", decoded_vp.presentation.holder));
    
    // 4. Extract and Validate Embedded Credentials
    let jwt_credentials: &Vec<Jwt> = &decoded_vp.presentation.verifiable_credential;
    output.push_str(&format!("📦 VP contains {} credential(s)\n", jwt_credentials.len()));

    let issuers: Vec<CoreDID> = jwt_credentials
        .iter()
        .map(|jwt| identity_iota::credential::JwtCredentialValidatorUtils::extract_issuer_from_jwt(jwt))
        .collect::<Result<Vec<CoreDID>, _>>()
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let issuers_documents: HashMap<CoreDID, IotaDocument> = resolver.resolve_multiple(&issuers).await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let credential_validator = JwtCredentialValidator::with_signature_verifier(EdDSAJwsVerifier::default());
    let credential_validation_options = JwtCredentialValidationOptions::default()
        .subject_holder_relationship(holder_did.to_url().into(), SubjectHolderRelationship::AlwaysSubject);

    for (index, jwt_vc) in jwt_credentials.iter().enumerate() {
        let issuer_doc = &issuers_documents[&issuers[index]];
        let result: Result<DecodedJwtCredential<Object>, _> = credential_validator
            .validate(jwt_vc, issuer_doc, &credential_validation_options, FailFast::FirstError);
        
        match result {
            Ok(decoded_credential) => {
                 let subject_id = decoded_credential
                    .credential
                    .credential_subject
                    .first()
                    .and_then(|subj| subj.id.as_ref())
                    .map(|id| id.as_str())
                    .unwrap_or("unknown");

                output.push_str(&format!(
                    "✅ Credential [{}]: verified successfully, subject: {}\n",
                    index + 1,
                    subject_id
                ));
            },
            Err(e) => {
                output.push_str(&format!("❌ Credential [{}] Validation Failed: {:?}\n", index + 1, e));
                return Ok(Json(ValidationResponse { success: false, output }));
            }
        }
    }

    output.push_str("\n🎉 All credentials in the VP are valid!");
    Ok(Json(ValidationResponse { success: true, output }))
}

// --- Main Application Setup ---

struct AppState {
    // We only need the package ID in the state to allow the client to be created in the handlers.
    package_id: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    // The environment variable must be set before starting the server
    let package_id = std::env::var("IOTA_IDENTITY_PKG_ID")
        .expect("The IOTA_IDENTITY_PKG_ID environment variable must be set.");
    
    // Set the environment variable used by identity_logic::get_read_only_client internally
    std::env::set_var("IOTA_IDENTITY_PKG_ID", &package_id);

    let shared_state = Arc::new(AppState {
        package_id: package_id.clone(),
    });

    let cors_layer = tower_http::cors::CorsLayer::new()
        .allow_origin(tower_http::cors::Any)
        .allow_methods([axum::http::Method::POST])
        .allow_headers([axum::http::header::CONTENT_TYPE]);

    let app = Router::new()
        .route("/api/holder/create-did", post(holder_create_did))
        .route("/api/issuer/issue-vc", post(issuer_issue_vc))
        .route("/api/holder/create-vp", post(holder_create_vp))
        .route("/api/verifier/validate", post(verifier_validate))
        .layer(cors_layer)
        .with_state(shared_state);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await?;
    println!("IOTA Identity Axum API Server running on http://0.0.0.0:3001");
    axum::serve(listener, app.into_make_service()).await?;

    Ok(())
}
