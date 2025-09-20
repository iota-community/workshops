module token_contract::wkt {
    use std::string;
    use iota::coin::{Self, TreasuryCap, Coin};
    use iota::table::{Self, Table};
    use iota::vec_map;
    use iota::event;

    // ===================== Token Type =====================
    public struct WKT has drop {}

    // ===================== NFT Badge =====================
    public struct WorkshopBadge has key, store {
        id: UID,
        recipient: address,
        minted_at: u64,
        workshop_id: string::String,
        url: string::String
    }

    // ===================== Faucet State =====================
    public struct Faucet has key {
        id: UID,
        treasury_cap: TreasuryCap<WKT>,
        admin: address,
        claimed: Table<address, u64>,
        user_coupons: Table<address, vec_map::VecMap<string::String, bool>>,
        nft_redeemed: Table<address, bool>,
        coupon_codes: vec_map::VecMap<string::String, bool>,
        badge_counter: u64,
        badge_issued: Table<address, bool>,
        auto_badge_workshop_id: string::String,
        auto_badge_url: string::String
    }

    // ===================== Events =====================
    public struct TokensClaimed has copy, drop {
        claimer: address,
        amount: u64,
        is_coupon: bool
    }

    public struct ClaimStatus has copy, drop {
    queried_address: address,
    has_claimed_today: bool
    }

    public struct BadgeMinted has copy, drop {
        recipient: address,
        badge_id: ID,
        workshop_id: string::String,
        url: string::String
    }

    public struct BadgeRedeemed has copy, drop {
        redeemer: address,
        amount: u64
    }

    public struct PaymentMade has copy, drop {
        from: address,
        to: address,
        amount: u64
    }

    // ===================== Error Codes =====================
    const EAlreadyClaimed: u64 = 1;
    const EInvalidCoupon: u64 = 2;
    const ECouponAlreadyUsed: u64 = 3;
    const ENotAdmin: u64 = 4;
    const ENoBadge: u64 = 5;
    const EAlreadyRedeemed: u64 = 6;
    const EInsufficientBalance: u64 = 7;

    // ===================== Initialization =====================
    fun init(witness: WKT, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency(
            witness,
            0,
            b"WKT",
            b"Workshop Token",
            b"Token for workshop participation and rewards",
            option::none(),
            ctx
        );

        transfer::public_freeze_object(metadata);

        let faucet = Faucet {
            id: object::new(ctx),
            treasury_cap,
            admin: tx_context::sender(ctx),
            claimed: table::new(ctx),
            user_coupons: table::new(ctx),
            nft_redeemed: table::new(ctx),
            coupon_codes: vec_map::empty(),
            badge_counter: 0,
            badge_issued: table::new(ctx),
            auto_badge_workshop_id: string::utf8(b""),
            auto_badge_url: string::utf8(b"")
        };

        transfer::share_object(faucet);
    }

    // ===================== Admin Functions =====================
    public entry fun add_coupon_code(
        faucet: &mut Faucet,
        code: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == faucet.admin, ENotAdmin);
        let code_str = string::utf8(code);
        vec_map::insert(&mut faucet.coupon_codes, code_str, true);
    }

    public entry fun remove_coupon_code(
        faucet: &mut Faucet,
        code: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == faucet.admin, ENotAdmin);
        let code_str = string::utf8(code);
        vec_map::remove(&mut faucet.coupon_codes, &code_str);
    }

    public entry fun transfer_admin(
        faucet: &mut Faucet,
        new_admin: address,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == faucet.admin, ENotAdmin);
        faucet.admin = new_admin;
    }

    public entry fun set_auto_badge_config(
        faucet: &mut Faucet,
        workshop_id: vector<u8>,
        url: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == faucet.admin, ENotAdmin);
        faucet.auto_badge_workshop_id = string::utf8(workshop_id);
        faucet.auto_badge_url = string::utf8(url);
    }

    public entry fun mint_badge(
        faucet: &mut Faucet,
        recipient: address,
        workshop_id: vector<u8>,
        url: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == faucet.admin, ENotAdmin);

        let badge = WorkshopBadge {
            id: object::new(ctx),
            recipient,
            minted_at: ctx.epoch_timestamp_ms(),
            workshop_id: string::utf8(workshop_id),
            url: string::utf8(url)
        };

        let badge_id = object::id(&badge);
        faucet.badge_counter = faucet.badge_counter + 1;
        transfer::public_transfer(badge, recipient);

        event::emit(BadgeMinted {
            recipient,
            badge_id,
            workshop_id: string::utf8(workshop_id),
            url: string::utf8(url)
        });
    }

    // ===================== User Functions =====================
    public entry fun claim_tokens(
        faucet: &mut Faucet,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let now_ms = ctx.epoch_timestamp_ms();
        let today: u64 = now_ms / 86400000u64;

        if (table::contains(&faucet.claimed, sender)) {
            let last_day_ref = table::borrow_mut(&mut faucet.claimed, sender);
            let last_day = *last_day_ref;
            assert!(last_day != today, EAlreadyClaimed);
            *last_day_ref = today;
        } else {
            table::add(&mut faucet.claimed, sender, today);
        };

        let coins = coin::mint(&mut faucet.treasury_cap, 10, ctx);
        transfer::public_transfer(coins, sender);

        event::emit(TokensClaimed {
            claimer: sender,
            amount: 10,
            is_coupon: false
        });
    }

    public entry fun claim_with_coupon(
        faucet: &mut Faucet,
        code: vector<u8>,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        let code_str = string::utf8(code);

        // Validate coupon code exists
        assert!(vec_map::contains(&faucet.coupon_codes, &code_str), EInvalidCoupon);

        // Check if user has already used this coupon
        if (table::contains(&faucet.user_coupons, sender)) {
            let user_coupons = table::borrow_mut(&mut faucet.user_coupons, sender);
            assert!(!vec_map::contains(user_coupons, &code_str), ECouponAlreadyUsed);
            vec_map::insert(user_coupons, code_str, true);
        } else {
            let mut user_coupons = vec_map::empty();
            vec_map::insert(&mut user_coupons, code_str, true);
            table::add(&mut faucet.user_coupons, sender, user_coupons);
        };

        let coins = coin::mint(&mut faucet.treasury_cap, 10, ctx);
        transfer::public_transfer(coins, sender);

        event::emit(TokensClaimed {
            claimer: sender,
            amount: 10,
            is_coupon: true
        });
    }

    public entry fun redeem_badge(
        faucet: &mut Faucet,
        badge: WorkshopBadge,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(badge.recipient == sender, ENoBadge);
        assert!(!table::contains(&faucet.nft_redeemed, sender), EAlreadyRedeemed);

        let coins = coin::mint(&mut faucet.treasury_cap, 30, ctx);
        transfer::public_transfer(coins, sender);

        table::add(&mut faucet.nft_redeemed, sender, true);

        let WorkshopBadge { id, recipient: _, minted_at: _, workshop_id: _, url: _ } = badge;
        object::delete(id);

        event::emit(BadgeRedeemed {
            redeemer: sender,
            amount: 30
        });
    }

    public entry fun make_payment(
        faucet: &mut Faucet,
        coin: &mut Coin<WKT>,
        recipient: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        assert!(coin::value(coin) >= amount, EInsufficientBalance);

        let payment = coin::split(coin, amount, ctx);
        transfer::public_transfer(payment, recipient);

        event::emit(PaymentMade {
            from: sender,
            to: recipient,
            amount
        });

        // Auto-mint badge for the sender if this is their first outgoing payment
        // AND if auto-badge configuration has been set
        if (!table::contains(&faucet.badge_issued, sender) && 
            !string::is_empty(&faucet.auto_badge_workshop_id) && 
            !string::is_empty(&faucet.auto_badge_url)) {
            
            let badge = WorkshopBadge {
                id: object::new(ctx),
                recipient: sender,
                minted_at: ctx.epoch_timestamp_ms(),
                workshop_id: faucet.auto_badge_workshop_id,
                url: faucet.auto_badge_url
            };

            let badge_id = object::id(&badge);
            faucet.badge_counter = faucet.badge_counter + 1;

            table::add(&mut faucet.badge_issued, sender, true);
            transfer::public_transfer(badge, sender);

            event::emit(BadgeMinted {
                recipient: sender,
                badge_id,
                workshop_id: faucet.auto_badge_workshop_id,
                url: faucet.auto_badge_url
            });
        };
    }

    // ===================== View Functions =====================
// This is an entry function to be used with devInspectTransactionBlock for a safe, read-only check.
public entry fun view_claim_status(faucet: &Faucet, ctx: &mut TxContext) {
    let sender = tx_context::sender(ctx);
    let now_ms = ctx.epoch_timestamp_ms();
    let today = now_ms / 86400000u64;

    let claimed_today = if (table::contains(&faucet.claimed, sender)) {
        let last_claim_day = *table::borrow(&faucet.claimed, sender);
        last_claim_day == today
    } else {
        false
    };

    event::emit(ClaimStatus {
        queried_address: sender,
        has_claimed_today: claimed_today
    });
}

    public fun has_redeemed_badge(faucet: &Faucet, addr: address): bool {
        table::contains(&faucet.nft_redeemed, addr)
    }

    public fun is_valid_coupon_for_user(faucet: &Faucet, code: vector<u8>, user: address): bool {
        let code_str = string::utf8(code);
        
        // Check if coupon exists
        if (!vec_map::contains(&faucet.coupon_codes, &code_str)) {
            return false
        };
        
        // Check if user has already used this coupon
        if (table::contains(&faucet.user_coupons, user)) {
            let user_coupons = table::borrow(&faucet.user_coupons, user);
            return !vec_map::contains(user_coupons, &code_str)
        };
        
        true
    }

    public fun get_badge_count(faucet: &Faucet): u64 {
        faucet.badge_counter
    }

    #[test_only]
    public fun test_init(ctx: &mut TxContext) {
        init(WKT {}, ctx)
    }
}