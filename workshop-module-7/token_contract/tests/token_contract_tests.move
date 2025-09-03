#[test_only]
module token_contract::wkt_tests {
    use iota::test_scenario::{Self, Scenario};
    use iota::coin::{Self, Coin};
    use token_contract::wkt::{
        WKT,
        Faucet,
        WorkshopBadge,
        test_init,
        add_coupon_code,
        remove_coupon_code,
        transfer_admin,
        set_auto_badge_config,
        mint_badge,
        claim_tokens,
        claim_with_coupon,
        redeem_badge,
        make_payment,
        is_valid_coupon_for_user,
        has_redeemed_badge,
        get_badge_count,
        EAlreadyClaimed,
        ECouponAlreadyUsed,
        ENotAdmin,
        EAlreadyRedeemed,
        EInsufficientBalance,
        EInvalidCoupon,
        ENoBadge
    };

    // === Test Addresses ===
    const ADMIN: address = @0xA1;
    const USER1: address = @0xB1;
    const USER2: address = @0xC1;

    // === Test Setup Function ===
    fun initialize(scenario: &mut Scenario) {
        test_scenario::next_tx(scenario, ADMIN);
        {
            // The call is now simpler and correct
            test_init(test_scenario::ctx(scenario));
        };
    }

    // === Test Cases ===

    #[test]
    fun test_admin_actions() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);

        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);
        
        // --- Add and Remove a Coupon ---
        add_coupon_code(&mut faucet, b"WELCOME10", test_scenario::ctx(test));
        assert!(is_valid_coupon_for_user(&faucet, b"WELCOME10", USER1), 0);
        test_scenario::next_tx(test, ADMIN);
        remove_coupon_code(&mut faucet, b"WELCOME10", test_scenario::ctx(test));
        assert!(!is_valid_coupon_for_user(&faucet, b"WELCOME10", USER1), 1);
        
        // --- Transfer Admin ---
        test_scenario::next_tx(test, ADMIN);
        transfer_admin(&mut faucet, USER1, test_scenario::ctx(test));

        // --- New Admin (USER1) performs an action ---
        test_scenario::next_tx(test, USER1);
        add_coupon_code(&mut faucet, b"NEWADMIN", test_scenario::ctx(test));
        assert!(is_valid_coupon_for_user(&faucet, b"NEWADMIN", USER2), 2);

        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = ENotAdmin)]
    fun test_fail_non_admin_action() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);

        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);

        // USER1 (not admin) tries to add a coupon
        test_scenario::next_tx(test, USER1);
        add_coupon_code(&mut faucet, b"FAIL_COUPON", test_scenario::ctx(test));

        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_successful_claims() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);

        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);
        add_coupon_code(&mut faucet, b"COUPON1", test_scenario::ctx(test));

        // USER1 claims daily tokens
        test_scenario::next_tx(test, USER1);
        claim_tokens(&mut faucet, test_scenario::ctx(test));
        
        // USER2 claims with a valid coupon
        test_scenario::next_tx(test, USER2);
        claim_with_coupon(&mut faucet, b"COUPON1", test_scenario::ctx(test));
        
        // --- Cleanup minted coins ---
        test_scenario::next_tx(test, USER1);
        let coins1 = test_scenario::take_from_sender<Coin<WKT>>(test);
        coin::burn_for_testing(coins1);
        
        test_scenario::next_tx(test, USER2);
        let coins2 = test_scenario::take_from_sender<Coin<WKT>>(test);
        coin::burn_for_testing(coins2);
        
        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EAlreadyClaimed)]
    fun test_fail_claim_tokens_twice_daily() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);
        
        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);

        // USER1 claims successfully
        test_scenario::next_tx(test, USER1);
        claim_tokens(&mut faucet, test_scenario::ctx(test));
        
        // USER1 tries to claim again in the same transaction block (simulates same day)
        claim_tokens(&mut faucet, test_scenario::ctx(test));

        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = ECouponAlreadyUsed)]
    fun test_fail_claim_with_used_coupon() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);
        
        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);
        add_coupon_code(&mut faucet, b"ONETIME", test_scenario::ctx(test));
        
        // USER1 uses the coupon successfully
        test_scenario::next_tx(test, USER1);
        claim_with_coupon(&mut faucet, b"ONETIME", test_scenario::ctx(test));
        
        // USER1 tries to use it again
        claim_with_coupon(&mut faucet, b"ONETIME", test_scenario::ctx(test));

        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EInvalidCoupon)]
    fun test_fail_claim_with_invalid_coupon() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);
        
        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);

        // USER1 tries to use a coupon that doesn't exist
        test_scenario::next_tx(test, USER1);
        claim_with_coupon(&mut faucet, b"FAKE_COUPON", test_scenario::ctx(test));

        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_mint_and_redeem_badge_successfully() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);
        
        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);

        // Admin mints a badge for USER1
        mint_badge(&mut faucet, USER1, b"W-101", b"ipfs://hash1", test_scenario::ctx(test));
        assert!(get_badge_count(&faucet) == 1, 0);

        // USER1 takes and redeems the badge
        test_scenario::next_tx(test, USER1);
        let badge = test_scenario::take_from_sender<WorkshopBadge>(test);
        redeem_badge(&mut faucet, badge, test_scenario::ctx(test));

        // Verify redeemed status and cleanup coins
        assert!(has_redeemed_badge(&faucet, USER1), 1);
        test_scenario::next_tx(test, USER1);
        let coins = test_scenario::take_from_sender<Coin<WKT>>(test);
        coin::burn_for_testing(coins);

        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = ENoBadge)]
    fun test_fail_redeem_badge_not_owned_by_sender() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);
        
        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);
        
        // Admin mints a badge for USER1
        mint_badge(&mut faucet, USER1, b"W-101", b"ipfs://hash1", test_scenario::ctx(test));
        
        // USER2 tries to redeem the badge (but doesn't have it)
        // This will fail at `take_from_sender` but if they somehow got it,
        // the contract would still fail with ENoBadge because badge.recipient is USER1
        
        // Let's simulate USER1 transferring the badge to USER2
        test_scenario::next_tx(test, USER1);
        let badge = test_scenario::take_from_sender<WorkshopBadge>(test);
        transfer::public_transfer(badge, USER2);
        
        // Now USER2 owns the badge object, but its internal `recipient` field is still USER1
        // USER2's attempt to redeem should fail the contract's internal check
        test_scenario::next_tx(test, USER2);
        let transferred_badge = test_scenario::take_from_sender<WorkshopBadge>(test);
        redeem_badge(&mut faucet, transferred_badge, test_scenario::ctx(test));

        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EAlreadyRedeemed)]
    fun test_fail_redeem_badge_twice() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);
        
        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);
        
        // Admin mints two badges for USER1
        mint_badge(&mut faucet, USER1, b"W101", b"url1", test_scenario::ctx(test));
        test_scenario::next_tx(test, ADMIN);
        mint_badge(&mut faucet, USER1, b"W102", b"url2", test_scenario::ctx(test));
        
        // USER1 redeems the first badge
        test_scenario::next_tx(test, USER1);
        let badge1 = test_scenario::take_from_sender<WorkshopBadge>(test);
        redeem_badge(&mut faucet, badge1, test_scenario::ctx(test));

        // USER1 tries to redeem the second badge
        test_scenario::next_tx(test, USER1);
        let badge2 = test_scenario::take_from_sender<WorkshopBadge>(test);
        redeem_badge(&mut faucet, badge2, test_scenario::ctx(test));

        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_payment_and_auto_badge() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);

        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);

        // Admin sets auto-badge config
        set_auto_badge_config( &mut faucet, b"First-Pay", b"ipfs://auto", test_scenario::ctx(test));
        // USER1 claims tokens
        test_scenario::next_tx(test, USER1);
        claim_tokens(&mut faucet, test_scenario::ctx(test));

        // USER1 makes first payment, triggering auto-badge
        test_scenario::next_tx(test, USER1);
        let mut coins = test_scenario::take_from_sender<Coin<WKT>>(test);
        make_payment(&mut faucet, &mut coins, USER2, 5, test_scenario::ctx(test));
        
        // Check badge count has increased
        assert!(get_badge_count(&faucet) == 1, 0);

        // USER1 makes a second payment, which should NOT mint another badge
        make_payment(&mut faucet, &mut coins, USER2, 2, test_scenario::ctx(test));
        assert!(get_badge_count(&faucet) == 1, 1);

        test_scenario::return_to_sender(test, coins);
        test_scenario::next_tx(test, USER1);
        let badge = test_scenario::take_from_sender<WorkshopBadge>(test);
        test_scenario::return_to_sender(test, badge);

        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }
    
    #[test]
    #[expected_failure(abort_code = EInsufficientBalance)]
    fun test_fail_payment_insufficient_funds() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test);

        test_scenario::next_tx(test, ADMIN);
        let mut faucet = test_scenario::take_shared<Faucet>(test);
        
        // USER1 claims 10 tokens
        test_scenario::next_tx(test, USER1);
        claim_tokens(&mut faucet, test_scenario::ctx(test));

        // USER1 tries to pay 20 tokens
        test_scenario::next_tx(test, USER1);
        let mut coins = test_scenario::take_from_sender<Coin<WKT>>(test);
        make_payment(&mut faucet, &mut coins, USER2, 20, test_scenario::ctx(test));

        // This part won't be reached, but is good practice for non-failing tests
        test_scenario::return_to_sender(test, coins);
        test_scenario::return_shared(faucet);
        test_scenario::end(scenario);
    }
}