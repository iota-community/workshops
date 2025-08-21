module voucher_shop::voucher_shop {
    use std::string;
    use iota::table;
    use iota::event;

    // ================= Error Codes =================
    const EAlreadyClaimed: u64 = 1;
    const ENoVoucher: u64 = 2;
    const EVoucherUsed: u64 = 3;
    const EInvalidNFT: u64 = 4;
    const ENotAdmin: u64 = 5;
    const ENftAlreadyExists: u64 = 6;
    const ENoCatalog: u64 = 7;

    // ================= Data Structures =================

    /// Voucher resource stored per user (keyed in voucher_table)
    public struct Voucher has key, store {
        id: UID,
        used: bool,
    }

    /// NFT template metadata (admin-managed catalog)
    public struct NFTMetadata has copy, drop, store {
        id: u64,
        name: string::String,
        image_uri: string::String,
        description: string::String,
    }

    /// Transferable NFT object minted on redemption.
    /// This object will be transferred to recipient using transfer::public_transfer,
    /// so wallets and explorers see it as a native transferable object.
    public struct VoucherNFT has key, store {
        id: UID,
        template_id: u64,
        name: string::String,
        image_uri: string::String,
        description: string::String,
        minted_at: u64,
        creator: address,
    }

    /// Core VoucherShop shared object
    public struct VoucherShop has key {
        id: UID,
        voucher_table: table::Table<address, Voucher>,            // address -> Voucher
        catalog: table::Table<u64, NFTMetadata>,                  // template id -> metadata
        admin: address,                                           // admin address
        nft_ids: vector<u64>,                                     // ordered list of template IDs
        redemption_history: table::Table<address, vector<u64>>,   // address -> redeemed template ids
    }

    // ================= Events =================
    // NOTE: Events must only include copyable types; UID is not copyable.
    public struct NFTAdded has copy, drop {
        nft_id: u64,
        name: string::String,
    }

    public struct VoucherClaimed has copy, drop {
        claimer: address,
    }

    public struct NFTRedeemed has copy, drop {
        recipient: address,
        nft_template_id: u64,
    }

    // ================= Initialization =================

    /// Deploy and share a new VoucherShop. The deployer becomes admin.
    public entry fun create_shop(ctx: &mut TxContext) {
        let id = object::new(ctx);
        let shop = VoucherShop {
            id,
            voucher_table: table::new<address, Voucher>(ctx),
            catalog: table::new<u64, NFTMetadata>(ctx),
            admin: tx_context::sender(ctx),
            nft_ids: vector::empty<u64>(),
            redemption_history: table::new<address, vector<u64>>(ctx),
        };
        transfer::share_object(shop);
    }

    // ================= Admin Functions =================

    /// Add an NFT template to the catalog. Admin only.
    public entry fun add_nft_to_catalog(
        shop: &mut VoucherShop,
        nft_id: u64,
        name: vector<u8>,
        image_uri: vector<u8>,
        description: vector<u8>,
        ctx: &mut TxContext
    ) {
        assert!(tx_context::sender(ctx) == shop.admin, ENotAdmin);
        assert!(!table::contains<u64, NFTMetadata>(&shop.catalog, nft_id), ENftAlreadyExists);

        let meta = NFTMetadata {
            id: nft_id,
            name: string::utf8(name),
            image_uri: string::utf8(image_uri),
            description: string::utf8(description),
        };

        table::add(&mut shop.catalog, nft_id, meta);
        vector::push_back(&mut shop.nft_ids, nft_id);

        let name_copy = table::borrow<u64, NFTMetadata>(&shop.catalog, nft_id).name;
        event::emit(NFTAdded { nft_id, name: name_copy });
    }

    /// Remove an NFT template from the catalog. Admin only.
    public entry fun remove_nft_from_catalog(shop: &mut VoucherShop, nft_id: u64, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == shop.admin, ENotAdmin);
        assert!(table::contains<u64, NFTMetadata>(&shop.catalog, nft_id), EInvalidNFT);

        table::remove<u64, NFTMetadata>(&mut shop.catalog, nft_id);

        // remove nft_id from nft_ids vector (linear scan)
        let mut i = 0;
        let len = vector::length(&shop.nft_ids);
        while (i < len) {
            let val = *vector::borrow(&shop.nft_ids, i);
            if (val == nft_id) {
                vector::swap_remove(&mut shop.nft_ids, i);
                break;
            };
            i = i + 1;
        };
    }

    /// Transfer admin to another address. Admin only.
    public entry fun transfer_admin(shop: &mut VoucherShop, new_admin: address, ctx: &mut TxContext) {
        assert!(tx_context::sender(ctx) == shop.admin, ENotAdmin);
        shop.admin = new_admin;
    }

    // ================= User-Facing Entrypoints =================

    /// Claim a one-time voucher.
    /// Emits VoucherClaimed event.
    public entry fun claim_voucher(shop: &mut VoucherShop, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);
        assert!(!table::contains<address, Voucher>(&shop.voucher_table, sender), EAlreadyClaimed);

        let voucher = Voucher {
            id: object::new(ctx),
            used: false,
        };

        table::add(&mut shop.voucher_table, sender, voucher);
        event::emit(VoucherClaimed { claimer: sender });
    }

    /// Redeem caller's voucher for a template. This mints a transferable VoucherNFT
    /// and transfers it directly to the recipient using `transfer::public_transfer`.
    public entry fun redeem_voucher(shop: &mut VoucherShop, nft_template_id: u64, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        // Ensure catalog has entries
        assert!(vector::length(&shop.nft_ids) > 0, ENoCatalog);

        // Voucher existence & state checks
        assert!(table::contains<address, Voucher>(&shop.voucher_table, sender), ENoVoucher);
        let voucher_ref = table::borrow_mut<address, Voucher>(&mut shop.voucher_table, sender);
        assert!(!voucher_ref.used, EVoucherUsed);

        // Template existence
        assert!(table::contains<u64, NFTMetadata>(&shop.catalog, nft_template_id), EInvalidNFT);
        let template = table::borrow<u64, NFTMetadata>(&shop.catalog, nft_template_id);

        // Mark voucher used BEFORE minting/transfer to avoid reentry/race
        voucher_ref.used = true;

        // Create transferable NFT object (VoucherNFT)
        let nft_obj = VoucherNFT {
            id: object::new(ctx),
            template_id: nft_template_id,
            name: template.name,
            image_uri: template.image_uri,
            description: template.description,
            minted_at: ctx.epoch_timestamp_ms(),
            creator: shop.admin,
        };

        // Emit event (no UID in event to avoid copy/drop errors)
        event::emit(NFTRedeemed { recipient: sender, nft_template_id });

        // Transfer the NFT object to the recipient wallet (makes it visible in wallet/explorer)
        transfer::public_transfer(nft_obj, sender);

        // Update redemption history table
        if (!table::contains<address, vector<u64>>(&shop.redemption_history, sender)) {
            let hist = vector::empty<u64>();
            table::add(&mut shop.redemption_history, sender, hist);
        };
        let hist_ref = table::borrow_mut<address, vector<u64>>(&mut shop.redemption_history, sender);
        vector::push_back(hist_ref, nft_template_id);
    }

    // ================= View / Read Functions =================

    /// Does `who` have a voucher?
    public fun has_voucher(shop: &VoucherShop, who: address): bool {
        table::contains<address, Voucher>(&shop.voucher_table, who)
    }

    /// Is the voucher for `who` used? Aborts if no voucher.
    public fun is_voucher_used(shop: &VoucherShop, who: address): bool {
        assert!(table::contains<address, Voucher>(&shop.voucher_table, who), ENoVoucher);
        let v = table::borrow<address, Voucher>(&shop.voucher_table, who);
        v.used
    }

    /// Get a copy of NFT metadata templates in the catalog.
    public fun view_available_nfts(shop: &VoucherShop): vector<NFTMetadata> {
        let mut out = vector::empty<NFTMetadata>();
        let len = vector::length(&shop.nft_ids);
        let mut i = 0;
        while (i < len) {
            let id = *vector::borrow(&shop.nft_ids, i);
            let meta = table::borrow<u64, NFTMetadata>(&shop.catalog, id);
            vector::push_back(&mut out, *meta);
            i = i + 1;
        };
        out
    }

    /// Get redemption history (template ids) for `who`.
    public fun get_redemption_history(shop: &VoucherShop, who: address): vector<u64> {
        if (!table::contains<address, vector<u64>>(&shop.redemption_history, who)) {
            return vector::empty<u64>();
        };
        let hv = table::borrow<address, vector<u64>>(&shop.redemption_history, who);
        let mut out = vector::empty<u64>();
        let len = vector::length(hv);
        let mut i = 0;
        while (i < len) {
            let v = *vector::borrow(hv, i);
            vector::push_back(&mut out, v);
            i = i + 1;
        };
        out
    }

    /// Return the catalog template IDs (copy)
    public fun get_nft_ids(shop: &VoucherShop): vector<u64> {
        let mut out = vector::empty<u64>();
        let len = vector::length(&shop.nft_ids);
        let mut i = 0;
        while (i < len) {
            let v = *vector::borrow(&shop.nft_ids, i);
            vector::push_back(&mut out, v);
            i = i + 1;
        };
        out
    }
}
