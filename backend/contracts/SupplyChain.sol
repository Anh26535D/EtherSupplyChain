// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert("Only owner can call this function");
        _;
    }

    // Custom Errors
    error RoleAlreadyRegistered(string role);
    error RoleNotRegistered(string role);
    error InvalidMedicineID(uint256 id);
    error InvalidStage(string reason);
    error Unauthorized(string reason);
    error SupplyChainNotReady(string missingRole);
    error IncorrectPrice(uint256 expected, uint256 provided);
    error InvalidCaller();
    error ItemNotReadyForSale();

    event UserRegistered(address indexed user, string role, string message);
    event StageChanged(
        uint256 indexed medicineId,
        Stage stage,
        address indexed operator,
        uint256 timestamp
    );
    event FundsReleased(address indexed seller, uint256 amount);

    enum Stage {
        Init,
        RawMaterialSupply,
        Manufacture,
        Distribution,
        Retail,
        Sold
    }

    enum RoleType {
        RawMaterialSupplier,
        Manufacturer,
        Distributor,
        Retailer
    }

    uint256 public medicineCount = 0;
    uint256 public rmsCount = 0;
    uint256 public manufacturerCount = 0;
    uint256 public distributorCount = 0;
    uint256 public retailerCount = 0;

    struct Medicine {
        uint256 id;
        uint256 rmsId;
        uint256 manId;
        uint256 disId;
        uint256 retId;
        Stage stage;
        uint256 timestamp;
        uint256 price;
        address payable seller;
        address payable buyer;
        bool isDisputed;
    }

    struct RoleData {
        address addr;
        uint256 id;
    }

    mapping(uint256 => Medicine) public medicines;

    mapping(uint256 => RoleData) public rawMaterialSuppliers;
    mapping(address => uint256) public rawMaterialSupplierIds;

    mapping(uint256 => RoleData) public manufacturers;
    mapping(address => uint256) public manufacturerIds;

    mapping(uint256 => RoleData) public distributors;
    mapping(address => uint256) public distributorIds;

    mapping(uint256 => RoleData) public retailers;
    mapping(address => uint256) public retailerIds;

    // Dispute Events
    event DisputeRaised(
        uint256 indexed medicineId,
        address indexed complainer,
        string reason
    );
    event DisputeResolved(
        uint256 indexed medicineId,
        address indexed resolver,
        bool refundBuyer
    );

    // Financial Events
    event InvoiceIssued(
        uint256 indexed medicineId,
        address indexed payer,
        address indexed payee,
        uint256 amount,
        string invoiceType
    );

    function _getRoleName(RoleType _role) private pure returns (string memory) {
        if (_role == RoleType.RawMaterialSupplier)
            return "Raw Material Supplier";
        if (_role == RoleType.Manufacturer) return "Manufacturer";
        if (_role == RoleType.Distributor) return "Distributor";
        if (_role == RoleType.Retailer) return "Retailer";
        return "";
    }

    function _addRole(
        mapping(address => uint256) storage _roleIds,
        mapping(uint256 => RoleData) storage _roles,
        uint256 _count,
        address _address,
        RoleType _role
    ) private {
        string memory roleName = _getRoleName(_role);
        if (_roleIds[_address] > 0) revert RoleAlreadyRegistered(roleName);

        _roles[_count] = RoleData(_address, _count);
        _roleIds[_address] = _count;

        emit UserRegistered(_address, roleName, "Registered Successfully");
    }

    function addRawMaterialSupplier(address _address) public onlyOwner {
        rmsCount++;
        _addRole(
            rawMaterialSupplierIds,
            rawMaterialSuppliers,
            rmsCount,
            _address,
            RoleType.RawMaterialSupplier
        );
    }

    function addManufacturer(address _address) public onlyOwner {
        manufacturerCount++;
        _addRole(
            manufacturerIds,
            manufacturers,
            manufacturerCount,
            _address,
            RoleType.Manufacturer
        );
    }

    function addDistributor(address _address) public onlyOwner {
        distributorCount++;
        _addRole(
            distributorIds,
            distributors,
            distributorCount,
            _address,
            RoleType.Distributor
        );
    }

    function addRetailer(address _address) public onlyOwner {
        retailerCount++;
        _addRole(
            retailerIds,
            retailers,
            retailerCount,
            _address,
            RoleType.Retailer
        );
    }

    function supplyRawMaterial(uint256 _medicineID, uint256 _price) public {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        uint256 _id = rawMaterialSupplierIds[msg.sender];
        if (_id == 0) revert RoleNotRegistered("Raw Material Supplier");

        if (medicines[_medicineID].stage != Stage.Init)
            revert InvalidStage("Medicine not in Init stage");

        medicines[_medicineID].rmsId = _id;
        medicines[_medicineID].stage = Stage.RawMaterialSupply;
        medicines[_medicineID].timestamp = block.timestamp;
        medicines[_medicineID].price = _price;
        medicines[_medicineID].seller = payable(msg.sender);

        emit StageChanged(
            _medicineID,
            Stage.RawMaterialSupply,
            msg.sender,
            block.timestamp
        );
    }

    function setPrice(uint256 _medicineID, uint256 _price) public {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        Medicine storage med = medicines[_medicineID];

        // Sanity Check: specific roles can only set price at their stage
        if (
            med.stage == Stage.RawMaterialSupply &&
            rawMaterialSupplierIds[msg.sender] == med.rmsId
        ) {
            med.price = _price;
            med.seller = payable(msg.sender);
        } else if (
            med.stage == Stage.Manufacture &&
            manufacturerIds[msg.sender] == med.manId
        ) {
            med.price = _price;
            med.seller = payable(msg.sender);
        } else if (
            med.stage == Stage.Distribution &&
            distributorIds[msg.sender] == med.disId
        ) {
            med.price = _price;
            med.seller = payable(msg.sender);
        } else if (
            med.stage == Stage.Retail && retailerIds[msg.sender] == med.retId
        ) {
            med.price = _price;
            med.seller = payable(msg.sender);
        } else {
            revert Unauthorized("Only current owner can set price");
        }
    }

    function purchaseItem(uint256 _medicineID) public payable {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        Medicine storage med = medicines[_medicineID];

        if (msg.value != med.price) revert IncorrectPrice(med.price, msg.value);
        if (med.seller == address(0)) revert ItemNotReadyForSale();
        if (med.isDisputed) revert Unauthorized("Item is currently disputed");

        Stage nextStage;

        if (med.stage == Stage.RawMaterialSupply) {
            uint256 _id = manufacturerIds[msg.sender];
            if (_id == 0) revert RoleNotRegistered("Manufacturer");
            med.manId = _id;
            nextStage = Stage.Manufacture;
        } else if (med.stage == Stage.Manufacture) {
            uint256 _id = distributorIds[msg.sender];
            if (_id == 0) revert RoleNotRegistered("Distributor");
            med.disId = _id;
            nextStage = Stage.Distribution;
        } else if (med.stage == Stage.Distribution) {
            uint256 _id = retailerIds[msg.sender];
            if (_id == 0) revert RoleNotRegistered("Retailer");
            med.retId = _id;
            nextStage = Stage.Retail;
        } else if (med.stage == Stage.Retail) {
            // Consumer buys? No role check for Sold
            nextStage = Stage.Sold;
        } else {
            revert InvalidStage("Item not availabe for purchase");
        }

        med.buyer = payable(msg.sender);
        med.stage = nextStage;
        med.timestamp = block.timestamp;

        emit StageChanged(_medicineID, nextStage, msg.sender, block.timestamp);

        // Emit Invoice Tokenization Event
        emit InvoiceIssued(
            _medicineID,
            msg.sender,
            med.seller,
            msg.value,
            "Purchase Invoice"
        );
    }

    function raiseDispute(uint256 _medicineID, string memory _reason) public {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        Medicine storage med = medicines[_medicineID];

        // Only buyer can raise dispute to stop funds
        if (msg.sender != med.buyer)
            revert Unauthorized("Only buyer can raise dispute");

        med.isDisputed = true;
        emit DisputeRaised(_medicineID, msg.sender, _reason);
    }

    function resolveDispute(
        uint256 _medicineID,
        bool _refundBuyer
    ) public onlyOwner {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        Medicine storage med = medicines[_medicineID];
        if (!med.isDisputed) revert Unauthorized("Item is not disputed");

        uint256 amount = med.price;
        address payable buyer = med.buyer;
        address payable seller = med.seller;

        med.isDisputed = false;
        med.price = 0; // Reset
        med.seller = payable(address(0));
        med.buyer = payable(address(0));

        if (_refundBuyer) {
            (bool sent, ) = buyer.call{value: amount}("");
            require(sent, "Refund failed");
            emit DisputeResolved(_medicineID, msg.sender, true);
        } else {
            (bool sent, ) = seller.call{value: amount}("");
            require(sent, "Release to seller failed");
            emit DisputeResolved(_medicineID, msg.sender, false);
        }
    }

    function confirmReceived(uint256 _medicineID) public {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        Medicine storage med = medicines[_medicineID];

        if (msg.sender != med.buyer) revert InvalidCaller();
        if (med.isDisputed)
            revert Unauthorized("Cannot confirm received while disputed");

        // Release funds to seller
        address payable seller = med.seller;
        uint256 price = med.price;

        // Prevent re-entrancy
        med.seller = payable(address(0));
        med.buyer = payable(address(0));
        med.price = 0;

        (bool success, ) = seller.call{value: price}("");
        require(success, "Transfer failed");

        emit FundsReleased(seller, price);

        // Intentionally NOT updating stage logic here to avoid logical skips
        // as the "purchaseItem" has already moved the stage to the Buyer's domain.
    }

    function findRawMaterialSupplier(
        address _address
    ) public view returns (uint256) {
        return rawMaterialSupplierIds[_address];
    }

    function findManufacturer(address _address) public view returns (uint256) {
        return manufacturerIds[_address];
    }

    function findDistributor(address _address) public view returns (uint256) {
        return distributorIds[_address];
    }

    function findRetailer(address _address) public view returns (uint256) {
        return retailerIds[_address];
    }

    function addMedicine() public onlyOwner {
        if (rmsCount == 0) revert SupplyChainNotReady("Raw Material Supplier");
        if (manufacturerCount == 0) revert SupplyChainNotReady("Manufacturer");
        if (distributorCount == 0) revert SupplyChainNotReady("Distributor");
        if (retailerCount == 0) revert SupplyChainNotReady("Retailer");

        medicineCount++;
        medicines[medicineCount] = Medicine(
            medicineCount,
            0,
            0,
            0,
            0,
            Stage.Init,
            block.timestamp,
            0,
            payable(address(0)),
            payable(address(0)),
            false
        );
        emit StageChanged(
            medicineCount,
            Stage.Init,
            msg.sender,
            block.timestamp
        );
    }
}
