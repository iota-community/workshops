export const ERROR_CODES = {
  EAlreadyClaimed: 1,
  ENoVoucher: 2,
  EVoucherUsed: 3,
  EInvalidNFT: 4,
  ENotAdmin: 5,
  ENftAlreadyExists: 6,
  ENoCatalog: 7,
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.EAlreadyClaimed]: "You have already claimed a voucher. Each user can only claim one voucher.",
  [ERROR_CODES.ENoVoucher]: "You don't have a voucher. Please claim a voucher first.",
  [ERROR_CODES.EVoucherUsed]: "Your voucher has already been used. You cannot redeem it again.",
  [ERROR_CODES.EInvalidNFT]: "The selected NFT template is invalid or doesn't exist.",
  [ERROR_CODES.ENotAdmin]: "You don't have admin permissions to perform this action.",
  [ERROR_CODES.ENftAlreadyExists]: "An NFT template with this ID already exists.",
  [ERROR_CODES.ENoCatalog]: "No NFT templates are available for redemption.",
} as const;

export interface VoucherShopError {
  code: number;
  message: string;
  userFriendlyMessage: string;
  suggestions?: string[];
}

export function parseVoucherShopError(error: any): VoucherShopError {
  console.error('Raw error:', error);
  
  // Default error structure
  let parsedError: VoucherShopError = {
    code: 0,
    message: "Unknown error occurred",
    userFriendlyMessage: "An unexpected error occurred. Please try again.",
    suggestions: ["Check your internet connection", "Refresh the page and try again"]
  };

  try {
    // Check if it's a Move abort error
    if (error?.message?.includes('MoveAbort')) {
      const abortMatch = error.message.match(/MoveAbort.*?(\d+)\)/);
      if (abortMatch) {
        const errorCode = parseInt(abortMatch[1]);
        parsedError = createVoucherShopError(errorCode);
      }
    }
    // Check for transaction execution errors
    else if (error?.cause?.message?.includes('MoveAbort')) {
      const abortMatch = error.cause.message.match(/MoveAbort.*?(\d+)\)/);
      if (abortMatch) {
        const errorCode = parseInt(abortMatch[1]);
        parsedError = createVoucherShopError(errorCode);
      }
    }
    // Check for specific error patterns in the message
    else if (error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('already claimed') || message.includes('ealreadyclaimed')) {
        parsedError = createVoucherShopError(ERROR_CODES.EAlreadyClaimed);
      } else if (message.includes('no voucher') || message.includes('enovoucher')) {
        parsedError = createVoucherShopError(ERROR_CODES.ENoVoucher);
      } else if (message.includes('voucher used') || message.includes('evoucherused')) {
        parsedError = createVoucherShopError(ERROR_CODES.EVoucherUsed);
      } else if (message.includes('invalid nft') || message.includes('einvalidnft')) {
        parsedError = createVoucherShopError(ERROR_CODES.EInvalidNFT);
      } else if (message.includes('not admin') || message.includes('enotadmin')) {
        parsedError = createVoucherShopError(ERROR_CODES.ENotAdmin);
      } else if (message.includes('no catalog') || message.includes('enocatalog')) {
        parsedError = createVoucherShopError(ERROR_CODES.ENoCatalog);
      }
      // Network/connection errors
      else if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
        parsedError = {
          code: -1,
          message: error.message,
          userFriendlyMessage: "Network connection error. Please check your internet connection.",
          suggestions: ["Check your internet connection", "Try again in a few moments", "Refresh the page"]
        };
      }
      // Wallet errors
      else if (message.includes('rejected') || message.includes('cancelled') || message.includes('denied')) {
        parsedError = {
          code: -2,
          message: error.message,
          userFriendlyMessage: "Transaction was cancelled or rejected.",
          suggestions: ["Please approve the transaction in your wallet", "Make sure you have sufficient gas fees"]
        };
      }
      // Gas/budget errors
      else if (message.includes('budget') || message.includes('gas') || message.includes('insufficient')) {
        parsedError = {
          code: -3,
          message: error.message,
          userFriendlyMessage: "Insufficient gas or budget for transaction.",
          suggestions: ["Make sure you have enough IOTA for gas fees", "Try increasing the gas limit"]
        };
      }
    }
  } catch (parseError) {
    console.error('Error parsing voucher shop error:', parseError);
  }

  return parsedError;
}

function createVoucherShopError(errorCode: number): VoucherShopError {
  const message = ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || "Unknown contract error";
  
  let suggestions: string[] = [];
  
  switch (errorCode) {
    case ERROR_CODES.EAlreadyClaimed:
      suggestions = [
        "You can only claim one voucher per account",
        "Check your voucher status in the dashboard",
        "If you have a voucher, you can proceed to redeem it for an NFT"
      ];
      break;
    case ERROR_CODES.ENoVoucher:
      suggestions = [
        "Click 'Claim Voucher' to get your voucher first",
        "Make sure you're using the correct wallet address"
      ];
      break;
    case ERROR_CODES.EVoucherUsed:
      suggestions = [
        "Each voucher can only be used once",
        "Check your NFT collection to see what you've already redeemed"
      ];
      break;
    case ERROR_CODES.EInvalidNFT:
      suggestions = [
        "Select a different NFT template from the available options",
        "Refresh the page to see updated NFT templates"
      ];
      break;
    case ERROR_CODES.ENoCatalog:
      suggestions = [
        "Wait for the admin to add NFT templates",
        "Contact the shop administrator"
      ];
      break;
    case ERROR_CODES.ENotAdmin:
      suggestions = [
        "Only the shop admin can perform this action",
        "Contact the shop administrator if you need help"
      ];
      break;
    default:
      suggestions = ["Please try again or contact support"];
  }

  return {
    code: errorCode,
    message,
    userFriendlyMessage: message,
    suggestions
  };
}