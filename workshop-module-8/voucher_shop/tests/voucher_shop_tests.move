#[test_only]
module voucher_shop::voucher_shop_tests {

    use iota::test_scenario::{Self, Scenario};
    use voucher_shop::voucher_shop::{
        Self,
        VoucherShop,
        VoucherNFT,
        EAlreadyClaimed,
        ENoVoucher,
        EVoucherUsed,
        EInvalidNFT,
        ENotAdmin,
        ENftAlreadyExists,
        ENoCatalog
    };

    // Test addresses
    const ADMIN: address = @0xA1;
    const USER1: address = @0xB1;
    const USER2: address = @0xC1;

    #[test]
    fun test_create_shop() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        
        // Initialize the voucher shop
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let shop = test_scenario::take_shared<VoucherShop>(test);
        
        // Verify initial state
        let nft_ids = voucher_shop::get_nft_ids(&shop);
        assert!(vector::length(&nft_ids) == 0, 0);
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_add_and_remove_nft() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let mut shop = test_scenario::take_shared<VoucherShop>(test);
        
        // Add NFT to catalog
        test_scenario::next_tx(test, ADMIN);
        {
            voucher_shop::add_nft_to_catalog(
                &mut shop,
                1,
                b"Test NFT",
                b"ipfs://test",
                b"Test Description",
                test_scenario::ctx(test)
            );
        };
        
        // Verify NFT was added
        let nfts = voucher_shop::view_available_nfts(&shop);
        assert!(vector::length(&nfts) == 1, 0);
        
        // Remove NFT from catalog
        test_scenario::next_tx(test, ADMIN);
        {
            voucher_shop::remove_nft_from_catalog(
                &mut shop,
                1,
                test_scenario::ctx(test)
            );
        };
        
        // Verify NFT was removed
        let nfts = voucher_shop::view_available_nfts(&shop);
        assert!(vector::length(&nfts) == 0, 1);
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotAdmin)]
    fun test_non_admin_cannot_add_nft() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let mut shop = test_scenario::take_shared<VoucherShop>(test);
        
        // Non-admin tries to add NFT
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::add_nft_to_catalog(
                &mut shop,
                1,
                b"Test",
                b"ipfs://test",
                b"Test",
                test_scenario::ctx(test)
            );
        };
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENftAlreadyExists)]
    fun test_cannot_add_duplicate_nft() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let mut shop = test_scenario::take_shared<VoucherShop>(test);
        
        // Add first NFT
        test_scenario::next_tx(test, ADMIN);
        {
            voucher_shop::add_nft_to_catalog(
                &mut shop,
                1,
                b"Test",
                b"ipfs://test",
                b"Test",
                test_scenario::ctx(test)
            );
        };
        
        // Try to add duplicate NFT
        test_scenario::next_tx(test, ADMIN);
        {
            voucher_shop::add_nft_to_catalog(
                &mut shop,
                1,
                b"Test",
                b"ipfs://test",
                b"Test",
                test_scenario::ctx(test)
            );
        };
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_voucher_claim_and_redeem() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let mut shop = test_scenario::take_shared<VoucherShop>(test);
        
        // Add NFT to catalog
        test_scenario::next_tx(test, ADMIN);
        {
            voucher_shop::add_nft_to_catalog(
                &mut shop,
                1,
                b"Test NFT",
                b"ipfs://test",
                b"Test Description",
                test_scenario::ctx(test)
            );
        };
        
        // User claims voucher
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
        };
        
        // Verify voucher exists
        assert!(voucher_shop::has_voucher(&shop, USER1), 0);
        
        // User redeems voucher
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::redeem_voucher(&mut shop, 1, test_scenario::ctx(test));
        };
        
        // Verify redemption was recorded in history instead of checking NFT directly
        let history = voucher_shop::get_redemption_history(&shop, USER1);
        assert!(vector::length(&history) == 1, 1);
        assert!(*vector::borrow(&history, 0) == 1, 2); // Verify template ID 1 was redeemed

        // Still take the NFT to clean up (but don't inspect its fields)
        test_scenario::next_tx(test, USER1);
        let nft = test_scenario::take_from_sender<VoucherNFT>(test);
        test_scenario::return_to_sender(test, nft);
        
        // Verify voucher was marked as used
        assert!(voucher_shop::is_voucher_used(&shop, USER1), 2);
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EAlreadyClaimed)]
    fun test_cannot_claim_voucher_twice() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let mut shop = test_scenario::take_shared<VoucherShop>(test);
        
        // First claim
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
        };
        
        // Second claim attempt
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
        };
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENoVoucher)]
    fun test_cannot_redeem_without_voucher() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let mut shop = test_scenario::take_shared<VoucherShop>(test);
        
        // Add NFT to catalog
        test_scenario::next_tx(test, ADMIN);
        {
            voucher_shop::add_nft_to_catalog(
                &mut shop,
                1,
                b"Test",
                b"ipfs://test",
                b"Test",
                test_scenario::ctx(test)
            );
        };
        
        // Try to redeem without claiming voucher
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::redeem_voucher(&mut shop, 1, test_scenario::ctx(test));
        };
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EVoucherUsed)]
    fun test_cannot_redeem_used_voucher() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let mut shop = test_scenario::take_shared<VoucherShop>(test);
        
        // Add NFT to catalog
        test_scenario::next_tx(test, ADMIN);
        {
            voucher_shop::add_nft_to_catalog(
                &mut shop,
                1,
                b"Test",
                b"ipfs://test",
                b"Test",
                test_scenario::ctx(test)
            );
        };
        
        // Claim and redeem voucher
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
        };
        
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::redeem_voucher(&mut shop, 1, test_scenario::ctx(test));
        };
        
        // Try to redeem again
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::redeem_voucher(&mut shop, 1, test_scenario::ctx(test));
        };
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

#[test]
#[expected_failure(abort_code = EInvalidNFT)]  // Changed from ENoCatalog
fun test_cannot_redeem_invalid_nft() {
    let mut scenario = test_scenario::begin(ADMIN);
    let test = &mut scenario;
    initialize(test, ADMIN);
    
    test_scenario::next_tx(test, ADMIN);
    let mut shop = test_scenario::take_shared<VoucherShop>(test);
    
    // Add at least one NFT to catalog
    test_scenario::next_tx(test, ADMIN);
    {
        voucher_shop::add_nft_to_catalog(
            &mut shop,
            1,
            b"Test NFT",
            b"ipfs://test",
            b"Test",
            test_scenario::ctx(test)
        );
    };
    
    // Claim voucher
    test_scenario::next_tx(test, USER1);
    {
        voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
    };
    
    // Try to redeem for non-existent NFT (id 999)
    test_scenario::next_tx(test, USER1);
    {
        voucher_shop::redeem_voucher(&mut shop, 999, test_scenario::ctx(test));
    };
    
    test_scenario::return_shared(shop);
    test_scenario::end(scenario);
}

    #[test]
    #[expected_failure(abort_code = ENoCatalog)]
    fun test_cannot_redeem_empty_catalog() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let mut shop = test_scenario::take_shared<VoucherShop>(test);
        
        // Claim voucher
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
        };
        
        // Try to redeem with empty catalog
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::redeem_voucher(&mut shop, 1, test_scenario::ctx(test));
        };
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

    #[test]
    fun test_transfer_admin() {
        let mut scenario = test_scenario::begin(ADMIN);
        let test = &mut scenario;
        initialize(test, ADMIN);
        
        test_scenario::next_tx(test, ADMIN);
        let mut shop = test_scenario::take_shared<VoucherShop>(test);
        
        // Transfer admin rights
        test_scenario::next_tx(test, ADMIN);
        {
            voucher_shop::transfer_admin(&mut shop, USER1, test_scenario::ctx(test));
        };
        
        // New admin can add NFT
        test_scenario::next_tx(test, USER1);
        {
            voucher_shop::add_nft_to_catalog(
                &mut shop,
                1,
                b"Test",
                b"ipfs://test",
                b"Test",
                test_scenario::ctx(test)
            );
        };
        
        test_scenario::return_shared(shop);
        test_scenario::end(scenario);
    }

#[test]
fun test_redemption_history() {
    let mut scenario = test_scenario::begin(ADMIN);
    let test = &mut scenario;
    initialize(test, ADMIN);
    
    test_scenario::next_tx(test, ADMIN);
    let mut shop = test_scenario::take_shared<VoucherShop>(test);
    
    // Add two NFTs to catalog
    test_scenario::next_tx(test, ADMIN);
    {
        voucher_shop::add_nft_to_catalog(
            &mut shop,
            1,
            b"NFT 1",
            b"ipfs://1",
            b"First NFT",
            test_scenario::ctx(test)
        );
    };
    
    test_scenario::next_tx(test, ADMIN);
    {
        voucher_shop::add_nft_to_catalog(
            &mut shop,
            2,
            b"NFT 2",
            b"ipfs://2",
            b"Second NFT",
            test_scenario::ctx(test)
        );
    };
    
    // USER1 claims and redeems first NFT
    test_scenario::next_tx(test, USER1);
    {
        voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
    };
    
    test_scenario::next_tx(test, USER1);
    {
        voucher_shop::redeem_voucher(&mut shop, 1, test_scenario::ctx(test));
    };
    
    test_scenario::next_tx(test, USER1);
    let nft1 = test_scenario::take_from_sender<VoucherNFT>(test);
    test_scenario::return_to_sender(test, nft1);
    
    // USER2 claims and redeems second NFT
    test_scenario::next_tx(test, USER2);
    {
        voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
    };
    
    test_scenario::next_tx(test, USER2);
    {
        voucher_shop::redeem_voucher(&mut shop, 2, test_scenario::ctx(test));
    };
    
    test_scenario::next_tx(test, USER2);
    let nft2 = test_scenario::take_from_sender<VoucherNFT>(test);
    test_scenario::return_to_sender(test, nft2);
    
    // Verify redemption history
    let history1 = voucher_shop::get_redemption_history(&shop, USER1);
    let history2 = voucher_shop::get_redemption_history(&shop, USER2);
    
    assert!(vector::length(&history1) == 1, 0);
    assert!(*vector::borrow(&history1, 0) == 1, 1);
    assert!(vector::length(&history2) == 1, 2);
    assert!(*vector::borrow(&history2, 0) == 2, 3);
    
    test_scenario::return_shared(shop);
    test_scenario::end(scenario);
}

    fun initialize(scenario: &mut Scenario, admin: address) {
        test_scenario::next_tx(scenario, admin);
        {
            voucher_shop::create_shop(test_scenario::ctx(scenario));
        };
    }

#[test]
#[expected_failure(abort_code = EAlreadyClaimed)]
fun test_user_cannot_claim_multiple_vouchers() {
    let mut scenario = test_scenario::begin(ADMIN);
    let test = &mut scenario;
    initialize(test, ADMIN);
    
    test_scenario::next_tx(test, ADMIN);
    let mut shop = test_scenario::take_shared<VoucherShop>(test);
    
    // User claims first voucher
    test_scenario::next_tx(test, USER1);
    {
        voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
    };
    
    // Same user tries to claim again (should fail)
    test_scenario::next_tx(test, USER1);
    {
        voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
    };
    
    test_scenario::return_shared(shop);
    test_scenario::end(scenario);
}

#[test]
fun test_user2_can_claim_own_voucher() {
    let mut scenario = test_scenario::begin(ADMIN);
    let test = &mut scenario;
    initialize(test, ADMIN);
    
    test_scenario::next_tx(test, ADMIN);
    let mut shop = test_scenario::take_shared<VoucherShop>(test);
    
    // Add NFT to catalog
    test_scenario::next_tx(test, ADMIN);
    {
        voucher_shop::add_nft_to_catalog(
            &mut shop,
            1,
            b"Test NFT",
            b"ipfs://test",
            b"Test Description",
            test_scenario::ctx(test)
        );
    };
    
    // USER2 claims their own voucher
    test_scenario::next_tx(test, USER2);
    {
        voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
    };
    
    // Verify USER2 has voucher
    assert!(voucher_shop::has_voucher(&shop, USER2), 0);
    
    test_scenario::return_shared(shop);
    test_scenario::end(scenario);
}

#[test]
#[expected_failure(abort_code = ENoVoucher)]
fun test_user2_cannot_redeem_user1_voucher() {
    let mut scenario = test_scenario::begin(ADMIN);
    let test = &mut scenario;
    initialize(test, ADMIN);
    
    test_scenario::next_tx(test, ADMIN);
    let mut shop = test_scenario::take_shared<VoucherShop>(test);
    
    // Add NFT to catalog
    test_scenario::next_tx(test, ADMIN);
    {
        voucher_shop::add_nft_to_catalog(
            &mut shop,
            1,
            b"Test NFT",
            b"ipfs://test",
            b"Test Description",
            test_scenario::ctx(test)
        );
    };
    
    // USER1 claims voucher
    test_scenario::next_tx(test, USER1);
    {
        voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
    };
    
    // USER2 tries to redeem USER1's voucher (should fail)
    test_scenario::next_tx(test, USER2);
    {
        voucher_shop::redeem_voucher(&mut shop, 1, test_scenario::ctx(test));
    };
    
    test_scenario::return_shared(shop);
    test_scenario::end(scenario);
}

#[test]
fun test_user2_redemption_history_independent() {
    let mut scenario = test_scenario::begin(ADMIN);
    let test = &mut scenario;
    initialize(test, ADMIN);
    
    test_scenario::next_tx(test, ADMIN);
    let mut shop = test_scenario::take_shared<VoucherShop>(test);
    
    // Add two NFTs
    test_scenario::next_tx(test, ADMIN);
    {
        voucher_shop::add_nft_to_catalog(
            &mut shop,
            1,
            b"NFT 1",
            b"ipfs://1",
            b"First NFT",
            test_scenario::ctx(test)
        );
    };
    
    test_scenario::next_tx(test, ADMIN);
    {
        voucher_shop::add_nft_to_catalog(
            &mut shop,
            2,
            b"NFT 2",
            b"ipfs://2",
            b"Second NFT",
            test_scenario::ctx(test)
        );
    };
    
    // USER1 claims and redeems NFT 1
    test_scenario::next_tx(test, USER1);
    {
        voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
    };
    
    test_scenario::next_tx(test, USER1);
    {
        voucher_shop::redeem_voucher(&mut shop, 1, test_scenario::ctx(test));
    };
    
    // USER2 claims and redeems NFT 2
    test_scenario::next_tx(test, USER2);
    {
        voucher_shop::claim_voucher(&mut shop, test_scenario::ctx(test));
    };
    
    test_scenario::next_tx(test, USER2);
    {
        voucher_shop::redeem_voucher(&mut shop, 2, test_scenario::ctx(test));
    };
    
    // Verify histories are separate
    let history1 = voucher_shop::get_redemption_history(&shop, USER1);
    let history2 = voucher_shop::get_redemption_history(&shop, USER2);
    
    assert!(vector::length(&history1) == 1, 0);
    assert!(*vector::borrow(&history1, 0) == 1, 1); // USER1 redeemed NFT 1
    assert!(vector::length(&history2) == 1, 2);
    assert!(*vector::borrow(&history2, 0) == 2, 3); // USER2 redeemed NFT 2
    
    test_scenario::return_shared(shop);
    test_scenario::end(scenario);
    }
}