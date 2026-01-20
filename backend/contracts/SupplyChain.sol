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

    event UserRegistered(address indexed user, string role, string message);
    event StageChanged(
        uint256 indexed medicineId,
        Stage stage,
        address indexed operator,
        uint256 timestamp
    );

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

    function supplyRawMaterial(uint256 _medicineID) public {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        uint256 _id = rawMaterialSupplierIds[msg.sender];
        if (_id == 0) revert RoleNotRegistered("Raw Material Supplier");

        if (medicines[_medicineID].stage != Stage.Init)
            revert InvalidStage("Medicine not in Init stage");

        medicines[_medicineID].rmsId = _id;
        medicines[_medicineID].stage = Stage.RawMaterialSupply;
        medicines[_medicineID].timestamp = block.timestamp;

        emit StageChanged(
            _medicineID,
            Stage.RawMaterialSupply,
            msg.sender,
            block.timestamp
        );
    }

    function findRawMaterialSupplier(
        address _address
    ) public view returns (uint256) {
        return rawMaterialSupplierIds[_address];
    }

    function manufacture(uint256 _medicineID) public {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        uint256 _id = manufacturerIds[msg.sender];
        if (_id == 0) revert RoleNotRegistered("Manufacturer");

        if (medicines[_medicineID].stage != Stage.RawMaterialSupply)
            revert InvalidStage("Medicine not in Raw Material Supply stage");

        medicines[_medicineID].manId = _id;
        medicines[_medicineID].stage = Stage.Manufacture;
        medicines[_medicineID].timestamp = block.timestamp;

        emit StageChanged(
            _medicineID,
            Stage.Manufacture,
            msg.sender,
            block.timestamp
        );
    }

    function findManufacturer(address _address) public view returns (uint256) {
        return manufacturerIds[_address];
    }

    function distribute(uint256 _medicineID) public {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        uint256 _id = distributorIds[msg.sender];
        if (_id == 0) revert RoleNotRegistered("Distributor");

        if (medicines[_medicineID].stage != Stage.Manufacture)
            revert InvalidStage("Medicine not in Manufacture stage");

        medicines[_medicineID].disId = _id;
        medicines[_medicineID].stage = Stage.Distribution;
        medicines[_medicineID].timestamp = block.timestamp;

        emit StageChanged(
            _medicineID,
            Stage.Distribution,
            msg.sender,
            block.timestamp
        );
    }

    function findDistributor(address _address) public view returns (uint256) {
        return distributorIds[_address];
    }

    function retail(uint256 _medicineID) public {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        uint256 _id = retailerIds[msg.sender];
        if (_id == 0) revert RoleNotRegistered("Retailer");

        if (medicines[_medicineID].stage != Stage.Distribution)
            revert InvalidStage("Medicine not in Distribution stage");

        medicines[_medicineID].retId = _id;
        medicines[_medicineID].stage = Stage.Retail;
        medicines[_medicineID].timestamp = block.timestamp;

        emit StageChanged(
            _medicineID,
            Stage.Retail,
            msg.sender,
            block.timestamp
        );
    }

    function findRetailer(address _address) public view returns (uint256) {
        return retailerIds[_address];
    }

    function sell(uint256 _medicineID) public {
        if (_medicineID == 0 || _medicineID > medicineCount)
            revert InvalidMedicineID(_medicineID);

        uint256 _id = retailerIds[msg.sender];
        if (_id == 0) revert RoleNotRegistered("Retailer");

        if (_id != medicines[_medicineID].retId)
            revert Unauthorized(
                "Only correct retailer can mark medicine as sold"
            );

        if (medicines[_medicineID].stage != Stage.Retail)
            revert InvalidStage("Medicine not in Retail stage");

        medicines[_medicineID].stage = Stage.Sold;
        medicines[_medicineID].timestamp = block.timestamp;

        emit StageChanged(_medicineID, Stage.Sold, msg.sender, block.timestamp);
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
            block.timestamp
        );
        emit StageChanged(
            medicineCount,
            Stage.Init,
            msg.sender,
            block.timestamp
        );
    }
}
