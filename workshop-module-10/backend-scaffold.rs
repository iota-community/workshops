// 1. Save this code in iota-identity-backend/src/main.rs.
// Run cargo build in the iota-identity-backend directory to verify the setup.
// You’ll implement the todo!() handlers in the main workshop steps.

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

// Step 1: Holder creates their DID
async fn holder_create_did(Json(_body): Json<PackageId>) -> Result<Json<DidResponse>, StatusCode> {
    todo!("Implement Step 1: Create or load Holder's DID")
}

// Step 2: Issuer issues VC
async fn issuer_issue_vc(Json(_body): Json<PackageId>) -> Result<Json<JwtResponse>, StatusCode> {
    todo!("Implement Step 2: Issue Verifiable Credential")
}

// Step 3: Holder creates VP
async fn holder_create_vp(Json(body): Json<VcJwt>) -> Result<Json<JwtResponse>, StatusCode> {
    todo!("Implement Step 3: Create Verifiable Presentation")
}

// Step 4: Verifier validates VP
async fn verifier_validate(Json(body): Json<VpJwt>) -> Result<Json<ValidationResponse>, StatusCode> {
    todo!("Implement Step 4: Validate Verifiable Presentation")
}

// --- Main Application Setup ---

struct AppState {
    package_id: String,
}

#[tokio::main]
async fn main() -> Result<()> {
    let package_id = std::env::var("IOTA_IDENTITY_PKG_ID")
        .expect("The IOTA_IDENTITY_PKG_ID environment variable must be set.");
    
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