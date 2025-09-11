export const ERROR_CODES = {
  EAlreadyClaimed: 1,
  EInvalidCoupon: 2,
  ECouponAlreadyUsed: 3,
  ENotAdmin: 4,
  ENoBadge: 5,
  EAlreadyRedeemed: 6,
  EInsufficientBalance: 7,
} as const;

export const ERROR_MESSAGES = {
  [ERROR_CODES.EAlreadyClaimed]: "You have already claimed tokens today. Please wait until tomorrow.",
  [ERROR_CODES.EInvalidCoupon]: "Invalid coupon code. Please check and try again.",
  [ERROR_CODES.ECouponAlreadyUsed]: "You have already used this coupon code.",
  [ERROR_CODES.ENotAdmin]: "You don't have admin permissions to perform this action.",
  [ERROR_CODES.ENoBadge]: "You don't own this badge.",
  [ERROR_CODES.EAlreadyRedeemed]: "You have already redeemed a badge.",
  [ERROR_CODES.EInsufficientBalance]: "Insufficient balance for this transaction.",
} as const;

export interface WKTError {
  code: number;
  message: string;
  userFriendlyMessage: string;
  suggestions?: string[];
}

export function parseWKTError(error: any): WKTError {
  let parsedError: WKTError = {
    code: 0,
    message: "Unknown error occurred",
    userFriendlyMessage: "An unexpected error occurred. Please try again.",
    suggestions: ["Check your internet connection", "Refresh the page and try again"]
  };

  try {
    if (error?.message?.includes('MoveAbort')) {
      const abortMatch = error.message.match(/MoveAbort.*?(\d+)\)/);
      if (abortMatch) {
        const errorCode = parseInt(abortMatch[1]);
        parsedError = createWKTError(errorCode);
      }
    } else if (error?.cause?.message?.includes('MoveAbort')) {
      const abortMatch = error.cause.message.match(/MoveAbort.*?(\d+)\)/);
      if (abortMatch) {
        const errorCode = parseInt(abortMatch[1]);
        parsedError = createWKTError(errorCode);
      }
    } else if (error?.message) {
      const message = error.message.toLowerCase();
      
      if (message.includes('already claimed') || message.includes('ealreadyclaimed')) {
        parsedError = createWKTError(ERROR_CODES.EAlreadyClaimed);
      } else if (message.includes('invalid coupon') || message.includes('einvalidcoupon')) {
        parsedError = createWKTError(ERROR_CODES.EInvalidCoupon);
      } else if (message.includes('coupon already used') || message.includes('ecouponalreadyused')) {
        parsedError = createWKTError(ERROR_CODES.ECouponAlreadyUsed);
      } else if (message.includes('not admin') || message.includes('enotadmin')) {
        parsedError = createWKTError(ERROR_CODES.ENotAdmin);
      } else if (message.includes('no badge') || message.includes('enobadge')) {
        parsedError = createWKTError(ERROR_CODES.ENoBadge);
      } else if (message.includes('already redeemed') || message.includes('ealreadyredeemed')) {
        parsedError = createWKTError(ERROR_CODES.EAlreadyRedeemed);
      } else if (message.includes('insufficient balance') || message.includes('einsufficientbalance')) {
        parsedError = createWKTError(ERROR_CODES.EInsufficientBalance);
      } else if (message.includes('network') || message.includes('connection') || message.includes('timeout')) {
        parsedError = {
          code: -1,
          message: error.message,
          userFriendlyMessage: "Network connection error. Please check your internet connection.",
          suggestions: ["Check your internet connection", "Try again in a few moments", "Refresh the page"]
        };
      } else if (message.includes('rejected') || message.includes('cancelled') || message.includes('denied')) {
        parsedError = {
          code: -2,
          message: error.message,
          userFriendlyMessage: "Transaction was cancelled or rejected.",
          suggestions: ["Please approve the transaction in your wallet", "Make sure you have sufficient gas fees"]
        };
      } else if (message.includes('budget') || message.includes('gas') || message.includes('insufficient')) {
        parsedError = {
          code: -3,
          message: error.message,
          userFriendlyMessage: "Insufficient gas or budget for transaction.",
          suggestions: ["Make sure you have enough IOTA for gas fees", "Try increasing the gas limit"]
        };
      }
    }
  } catch (parseError) {
    console.error('Error parsing WKT error:', parseError);
  }

  return parsedError;
}

function createWKTError(errorCode: number): WKTError {
  const message = ERROR_MESSAGES[errorCode as keyof typeof ERROR_MESSAGES] || "Unknown contract error";
  
  let suggestions: string[] = [];
  
  switch (errorCode) {
    case ERROR_CODES.EAlreadyClaimed:
      suggestions = [
        "You can claim tokens once per day",
        "Come back tomorrow to claim more tokens"
      ];
      break;
    case ERROR_CODES.EInvalidCoupon:
      suggestions = [
        "Check the coupon code for typos",
        "Contact the administrator for valid coupon codes"
      ];
      break;
    case ERROR_CODES.ECouponAlreadyUsed:
      suggestions = [
        "Each coupon can only be used once per user",
        "Ask for a new coupon code if needed"
      ];
      break;
    case ERROR_CODES.ENoBadge:
      suggestions = [
        "Make sure you own the badge you're trying to redeem",
        "Check your badge gallery to see your available badges"
      ];
      break;
    case ERROR_CODES.EAlreadyRedeemed:
      suggestions = [
        "Each badge can only be redeemed once",
        "Check your token balance to see your redeemed amount"
      ];
      break;
    case ERROR_CODES.EInsufficientBalance:
      suggestions = [
        "Check your token balance",
        "Claim daily tokens or use a coupon to get more tokens"
      ];
      break;
    case ERROR_CODES.ENotAdmin:
      suggestions = [
        "Only the contract admin can perform this action",
        "Contact the administrator if you need assistance"
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