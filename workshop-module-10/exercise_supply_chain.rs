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
struct RequestBody { package_id: String, vc_jwt: Option<String>, vp_jwt: Option<String> }

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ApiResponse { did: Option<String>, jwt: Option<String>, success: Option<bool>, output: Option<String> }

// --- HELPERS ---
async fn create_or_load_did(doc_file: &str, fragment_file: &str, stronghold_path: &str) -> Result<(IotaDocument, String)> {
    // TODO: Students can reuse the helper logic from the previous workshop 
    // to initialize the Stronghold storage and create/load a DID.
    unimplemented!("Student Task: Implement DID creation/loading logic");
}

// --- TASKS FOR STUDENTS ---

/// TASK 1: Logistics Provider (Holder) DID Creation
/// Students should initialize their identity as the carrier of the goods.
async fn logistics_provider_create_did() -> Result<Json<ApiResponse>, StatusCode> {
    println!(">> Task 1: Creating Logistics Provider DID...");
    
    // TODO: 1. Define paths for 'logistics.stronghold' and 'logistics_doc.json'
    // TODO: 2. Call create_or_load_did helper
    // TODO: 3. Return the DID string in the response

    Err(StatusCode::NOT_IMPLEMENTED)
}

/// TASK 2: Manufacturer (Issuer) issues Product Origin VC
/// The Manufacturer signs a credential stating that a specific 'PackageID' is authentic.
async fn manufacturer_issue_origin_vc(Json(body): Json<RequestBody>) -> Result<Json<ApiResponse>, StatusCode> {
    println!(">> Task 2: Issuing Product Origin Credential for package: {}", body.package_id);

    // TODO: 1. Load/Create Manufacturer DID (issuer)
    // TODO: 2. Load Logistics Provider DID (subject) from disk
    
    // TODO: 3. Construct the Credential Subject
    // Hint: Use json!({ "id": holder_did, "productID": body.package_id, "origin": "Factory_A" })

    // TODO: 4. Build the Credential using CredentialBuilder
    
    // TODO: 5. Sign the Credential using the Manufacturer's Stronghold and fragment
    
    // TODO: 6. Return the resulting JWT

    Err(StatusCode::NOT_IMPLEMENTED)
}

/// TASK 3: Logistics Provider (Holder) creates a Presentation for the Retailer
/// Before the retailer accepts the delivery, the courier proves the origin.
async fn logistics_create_delivery_vp(Json(body): Json<RequestBody>) -> Result<Json<ApiResponse>, StatusCode> {
    let vc_jwt = body.vc_jwt.ok_or(StatusCode::BAD_REQUEST)?;

    // TODO: 1. Load Logistics Provider DID and Storage
    
    // TODO: 2. Create a 'challenge' and 'expiry' for the presentation
    
    // TODO: 3. Build the Presentation (VP) containing the Manufacturer's VC
    
    // TODO: 4. Sign the VP using Logistics Provider's keys
    
    // TODO: 5. Return the VP JWT

    Err(StatusCode::NOT_IMPLEMENTED)
}

/// TASK 4: Retailer (Verifier) validates the Proof of Origin
/// The retailer verifies the VP is from the Logistics provider AND the VC inside is from the Manufacturer.
async fn retailer_verify_delivery(Json(body): Json<RequestBody>) -> Result<Json<ApiResponse>, StatusCode> {
    let vp_jwt_str = body.vp_jwt.ok_or(StatusCode::BAD_REQUEST)?;
    let vp_jwt = Jwt::new(vp_jwt_str);
    
    // TODO: 1. Setup the Resolver to talk to the IOTA Network
    
    // TODO: 2. Extract the Holder's DID from the VP and resolve it
    
    // TODO: 3. Validate the VP signature and the challenge (nonce)

    // TODO: 4. Extract Issuers from the credentials inside the VP and resolve them
    
    // TODO: 5. Validate the embedded Credential (VC) 
    // Hint: Ensure the 'subject' of the VC matches the 'holder' of the VP!

    // TODO: 6. Return success: true if all checks pass

    Err(StatusCode::NOT_IMPLEMENTED)
}

// --- Main Application Setup ---

#[tokio::main]
async fn main() -> Result<()> {
    // Note: Ensure IOTA_IDENTITY_PKG_ID is set
    let app = Router::new()
        .route("/api/supply-chain/logistics/create-did", post(logistics_provider_create_did))
        .route("/api/supply-chain/manufacturer/issue", post(manufacturer_issue_origin_vc))
        .route("/api/supply-chain/logistics/present", post(logistics_create_delivery_vp))
        .route("/api/supply-chain/retailer/verify", post(retailer_verify_delivery));

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3002").await?;
    println!("Supply Chain Workshop running on http://0.0.0.0:3002");
    axum::serve(listener, app.into_make_service()).await?;
    Ok(())
}