// Save this code in iota-identity-frontend/src/App.jsx.
// Run npm install and npm run dev in the iota-identity-frontend directory to verify the frontend runs.
// You’ll implement the step-specific handlers (handleCreateDid, etc.) in the main workshop steps.

import React, { useState, useCallback, useMemo } from 'react';
import { Settings, User, Landmark, Shield, CheckCheck, XCircle, ArrowRight } from 'lucide-react';

// --- Reusable UI Components ---

const Card = ({ title, children, status = 'default', icon: Icon, step }) => {
    let borderColor = 'border-gray-300';
    let titleBg = 'bg-gray-50';

    if (status === 'success') {
        borderColor = 'border-green-500';
        titleBg = 'bg-green-50';
    } else if (status === 'error') {  
        borderColor = 'border-red-500';
        titleBg = 'bg-red-50';
    } else if (status === 'active') {
        borderColor = 'border-blue-500';
        titleBg = 'bg-blue-50';
    }

    return (
        <div className={`rounded-xl border-2 ${borderColor} shadow-lg transition-all duration-300 bg-white`}>
            <div className={`p-4 ${titleBg} rounded-t-xl flex items-center justify-between`}>
                <div className="flex items-center space-x-3">
                    {Icon && <Icon className="w-6 h-6 text-gray-700" />}
                    <h2 className="text-xl font-semibold text-gray-800">{step}. {title}</h2>
                </div>
                {status === 'success' && <CheckCheck className="w-5 h-5 text-green-600" />}
            </div>
            <div className="p-4 space-y-3">
                {children}
            </div>
        </div>
    );
};

const Button = ({ onClick, disabled, loading, children, className = '' }) => (
    <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`w-full flex items-center justify-center space-x-2 px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white shadow-lg 
                    transition duration-150 ease-in-out ${className}
                    ${disabled || loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
            }`}
    >
        {loading && (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
        )}
        <span>{children}</span>
    </button>
);

const DisplayBox = ({ label, content, error }) => (
    <div className="space-y-1">
        <label className="text-sm font-medium text-gray-700 flex items-center space-x-1">
            {label}
            {error && <XCircle className="w-4 h-4 text-red-500" />}
        </label>
        <textarea
            readOnly
            value={error || content || 'Awaiting execution...'}
            rows={content && content.length > 100 ? 5 : 2}
            className={`w-full p-2 border rounded-md text-sm font-mono resize-none ${error ? 'border-red-400 bg-red-50 text-red-800' : 'border-gray-200 bg-gray-50 text-gray-800'}`}
        />
    </div>
);

// --- Main Application Component ---

const App = () => {
    // Connection Settings
    const [packageId, setPackageId] = useState('your-iota-identity-pkg-id');
    const [apiUrl, setApiUrl] = useState('http://localhost:3001/api'); 

    // Workflow State
    const [did, setDid] = useState('');
    const [vcJwt, setVcJwt] = useState('');
    const [vpJwt, setVpJwt] = useState('');
    const [validationOutput, setValidationOutput] = useState('');
    const [isValidationSuccess, setIsValidationSuccess] = useState(false);
    
    // UI State
    const [loadingStep, setLoadingStep] = useState(0); 
    const [error, setError] = useState('');

    const resetState = () => {
        setDid('');
        setVcJwt('');
        setVpJwt('');
        setValidationOutput('');
        setIsValidationSuccess(false);
        setError('');
        setLoadingStep(0);
    };

    const handleApiCall = useCallback(async (step, endpoint, body) => {
        if (!packageId || packageId === 'your-iota-identity-pkg-id') {
            setError('Please set a valid IOTA Identity Package ID in the settings.');
            return null;
        }
        if (!apiUrl) {
            setError('Please set the API Base URL in the settings.');
            return null;
        }

        setLoadingStep(step);
        setError('');
        
        // Minimal exponential backoff retry logic
        const maxRetries = 3;
        const initialDelay = 1000;

        for (let attempt = 0; attempt < maxRetries; attempt++) {
            try {
                const response = await fetch(`${apiUrl}${endpoint}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ packageId, ...body }),
                });

                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`API returned status ${response.status}: ${errorText}`);
                }

                const data = await response.json();
                setLoadingStep(0);
                return data;

            } catch (err) {
                if (attempt === maxRetries - 1) {
                    setError(`Error in Step ${step}: ${err.message}`);
                    setLoadingStep(0);
                    return null;
                }
                const delay = initialDelay * (2 ** attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
                console.warn(`Retrying Step ${step} (${attempt + 1}/${maxRetries})...`);
            }
        }
    }, [packageId, apiUrl]); 

    // --- Workflow Handlers ---

    // Step 1: Holder creates DID
    const handleCreateDid = async () => {
        // To be implemented in Step 1
    };

    // Step 2: Issuer issues VC
    const handleIssueVc = async () => {
        // To be implemented in Step 2
    };

    // Step 3: Holder creates VP
    const handleCreateVp = async () => {
        // To be implemented in Step 3
    };

    // Step 4: Verifier validates VP
    const handleValidateVp = async () => {
        // To be implemented in Step 4
    };

    // --- Status and Control Logic ---

    const currentStep = useMemo(() => {
        if (!did) return 1;
        if (!vcJwt) return 2;
        if (!vpJwt) return 3;
        return 4;
    }, [did, vcJwt, vpJwt]);

    const getStepStatus = (step) => {
        if (loadingStep === step) return 'active';
        if (currentStep > step) return 'success';
        if (currentStep === step && error) return 'error';
        return 'default';
    };

    const getValidationStatus = () => {
        if (!validationOutput) return 'default';
        return isValidationSuccess ? 'success' : 'error';
    };

    // --- Render ---

    return (
        <div className="min-h-screen bg-gray-100 p-8 font-inter">
            <style>
                {`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; }
                `}
            </style>
            
            <div className="w-full max-w-6xl mx-auto">
                <header className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        IOTA DID Verification Workshop
                    </h1>
                    <p className="text-gray-600">
                        Demonstrating the end-to-end lifecycle of a Verifiable Credential using React and a Native Rust API (Axum).
                    </p>
                    
                    <div className="mt-4 flex flex-col p-4 bg-white rounded-xl shadow-lg border border-gray-200">
                        <div className="flex items-center text-lg font-semibold text-gray-800 mb-3 space-x-2">
                            <Settings className="w-5 h-5 text-gray-500" />
                            <span>Connection Settings</span>
                        </div>
                        <div className="space-y-3">
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <label className="text-sm font-medium text-gray-700 sm:w-1/4">IOTA Package ID:</label>
                                <input
                                    type="text"
                                    value={packageId}
                                    onChange={(e) => setPackageId(e.target.value)}
                                    placeholder="Enter IOTA_IDENTITY_PKG_ID"
                                    className="flex-grow p-2 border border-gray-300 rounded-lg text-sm font-mono mt-1 sm:mt-0"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row sm:items-center">
                                <label className="text-sm font-medium text-gray-700 sm:w-1/4">API Base URL:</label>
                                <input
                                    type="url"
                                    value={apiUrl}
                                    onChange={(e) => setApiUrl(e.target.value)}
                                    placeholder="e.g., http://localhost:3001/api"
                                    className="flex-grow p-2 border border-gray-300 rounded-lg text-sm font-mono mt-1 sm:mt-0"
                                />
                            </div>
                            <div className="flex justify-end pt-2">
                                <button
                                    onClick={resetState}
                                    className="px-3 py-1 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition duration-150"
                                >
                                    Reset Flow
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {error && (
                    <div className="w-full max-w-6xl mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-lg shadow-md">
                        <p className="font-bold">Execution Error</p>
                        <p className="text-sm whitespace-pre-wrap">{error}</p>
                        <p className="text-xs mt-1">Check your Rust server console for details.</p>
                    </div>
                )}

                <div className="space-y-6">
                    <Card title="Holder Creates DID" step={1} icon={User} status={getStepStatus(1)}>
                        <DisplayBox label="Holder DID (did:iota:...)" content={did} />
                        <Button 
                            onClick={handleCreateDid} 
                            disabled={currentStep > 1 || !apiUrl || packageId === 'your-iota-identity-pkg-id'} 
                            loading={loadingStep === 1}
                            className="bg-purple-600 hover:bg-purple-700"
                        >
                            {did ? 'DID Already Created' : 'Execute Step 1: Create/Load DID'}
                        </Button>
                    </Card>

                    <div className="flex justify-center">
                        <ArrowRight className={`w-8 h-8 ${did ? 'text-gray-500' : 'text-gray-300'}`} />
                    </div>
                    
                    <Card title="Issuer Issues Verifiable Credential (VC)" step={2} icon={Landmark} status={getStepStatus(2)}>
                        <DisplayBox label="Verifiable Credential (VC JWT)" content={vcJwt} />
                        <Button 
                            onClick={handleIssueVc} 
                            disabled={currentStep !== 2} 
                            loading={loadingStep === 2}
                            className="bg-orange-600 hover:bg-orange-700"
                        >
                            {vcJwt ? 'VC Already Issued' : 'Execute Step 2: Issue VC'}
                        </Button>
                    </Card>
                    
                    <div className="flex justify-center">
                        <ArrowRight className={`w-8 h-8 ${vcJwt ? 'text-gray-500' : 'text-gray-300'}`} />
                    </div>

                    <Card title="Holder Creates Verifiable Presentation (VP)" step={3} icon={User} status={getStepStatus(3)}>
                        <DisplayBox label="Verifiable Presentation (VP JWT)" content={vpJwt} />
                        <Button 
                            onClick={handleCreateVp} 
                            disabled={currentStep !== 3} 
                            loading={loadingStep === 3}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {vpJwt ? 'VP Already Created' : 'Execute Step 3: Create VP'}
                        </Button>
                    </Card>

                    <div className="flex justify-center">
                        <ArrowRight className={`w-8 h-8 ${vpJwt ? 'text-gray-500' : 'text-gray-300'}`} />
                    </div>

                    <Card title="Verifier Validates Presentation" step={4} icon={Shield} status={getValidationStatus()}>
                        <DisplayBox 
                            label="Validation Output" 
                            content={validationOutput} 
                            error={!isValidationSuccess && validationOutput ? validationOutput : ''}
                        />
                        <Button 
                            onClick={handleValidateVp} 
                            disabled={currentStep !== 4 || validationOutput} 
                            loading={loadingStep === 4}
                        >
                            Execute Step 4: Validate VP
                        </Button>
                        {isValidationSuccess && (
                            <div className="mt-3 text-center text-lg font-semibold text-green-600">
                                Verification Complete! The Degree is Authentic.
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default App;