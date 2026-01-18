// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

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

    uint256 public medicineCount = 0;
    uint256 public rmsCount = 0;
    uint256 public manufacturerCount = 0;
    uint256 public distributorCount = 0;
    uint256 public retailerCount = 0;

    struct Medicine {
        uint256 id;
        string name;
        string description;
        uint256 rmsId;
        uint256 manId;
        uint256 disId;
        uint256 retId;
        Stage stage;
        uint256 timestamp;
    }

    mapping(uint256 => Medicine) public medicines;

    function getMedicineStage(
        uint256 _medicineID
    ) public view returns (string memory) {
        require(medicineCount > 0, "No medicines registered");
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid Medicine ID"
        );

        Stage stage = medicines[_medicineID].stage;

        if (stage == Stage.Init) return "Medicine Ordered";
        else if (stage == Stage.RawMaterialSupply)
            return "Raw Material Supply Stage";
        else if (stage == Stage.Manufacture) return "Manufacturing Stage";
        else if (stage == Stage.Distribution) return "Distribution Stage";
        else if (stage == Stage.Retail) return "Retail Stage";
        else if (stage == Stage.Sold) return "Medicine Sold";
        return "";
    }

    struct RawMaterialSupplier {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    mapping(uint256 => RawMaterialSupplier) public rawMaterialSuppliers;

    struct Manufacturer {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    mapping(uint256 => Manufacturer) public manufacturers;

    struct Distributor {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    mapping(uint256 => Distributor) public distributors;

    struct Retailer {
        address addr;
        uint256 id;
        string name;
        string place;
    }

    mapping(uint256 => Retailer) public retailers;

    function addRawMaterialSupplier(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyOwner {
        require(findRawMaterialSupplier(_address) == 0, "Already Registered");
        rmsCount++;
        rawMaterialSuppliers[rmsCount] = RawMaterialSupplier(
            _address,
            rmsCount,
            _name,
            _place
        );
        emit UserRegistered(
            _address,
            "Raw Material Supplier",
            "Registered Successfully"
        );
    }

    function addManufacturer(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyOwner {
        require(findManufacturer(_address) == 0, "Already Registered");
        manufacturerCount++;
        manufacturers[manufacturerCount] = Manufacturer(
            _address,
            manufacturerCount,
            _name,
            _place
        );
        emit UserRegistered(
            _address,
            "Manufacturer",
            "Registered Successfully"
        );
    }

    function addDistributor(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyOwner {
        require(findDistributor(_address) == 0, "Already Registered");
        distributorCount++;
        distributors[distributorCount] = Distributor(
            _address,
            distributorCount,
            _name,
            _place
        );
        emit UserRegistered(_address, "Distributor", "Registered Successfully");
    }

    function addRetailer(
        address _address,
        string memory _name,
        string memory _place
    ) public onlyOwner {
        require(findRetailer(_address) == 0, "Already Registered");
        retailerCount++;
        retailers[retailerCount] = Retailer(
            _address,
            retailerCount,
            _name,
            _place
        );
        emit UserRegistered(_address, "Retailer", "Registered Successfully");
    }

    function supplyRawMaterial(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid Medicine ID"
        );
        uint256 _id = findRawMaterialSupplier(msg.sender);
        require(_id > 0, "Not a registered Raw Material Supplier");
        require(
            medicines[_medicineID].stage == Stage.Init,
            "Medicine not in Init stage"
        );
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
    ) private view returns (uint256) {
        for (uint256 i = 1; i <= rmsCount; i++) {
            if (rawMaterialSuppliers[i].addr == _address)
                return rawMaterialSuppliers[i].id;
        }
        return 0;
    }

    function manufacture(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid Medicine ID"
        );
        uint256 _id = findManufacturer(msg.sender);
        require(_id > 0, "Not a registered Manufacturer");
        require(
            medicines[_medicineID].stage == Stage.RawMaterialSupply,
            "Medicine not in Raw Material Supply stage"
        );
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

    function findManufacturer(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= manufacturerCount; i++) {
            if (manufacturers[i].addr == _address) return manufacturers[i].id;
        }
        return 0;
    }

    function distribute(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid Medicine ID"
        );
        uint256 _id = findDistributor(msg.sender);
        require(_id > 0, "Not a registered Distributor");
        require(
            medicines[_medicineID].stage == Stage.Manufacture,
            "Medicine not in Manufacture stage"
        );
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

    function findDistributor(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= distributorCount; i++) {
            if (distributors[i].addr == _address) return distributors[i].id;
        }
        return 0;
    }

    function retail(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid Medicine ID"
        );
        uint256 _id = findRetailer(msg.sender);
        require(_id > 0, "Not a registered Retailer");
        require(
            medicines[_medicineID].stage == Stage.Distribution,
            "Medicine not in Distribution stage"
        );
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

    function findRetailer(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= retailerCount; i++) {
            if (retailers[i].addr == _address) return retailers[i].id;
        }
        return 0;
    }

    function sell(uint256 _medicineID) public {
        require(
            _medicineID > 0 && _medicineID <= medicineCount,
            "Invalid Medicine ID"
        );
        uint256 _id = findRetailer(msg.sender);
        require(_id > 0, "Not a registered Retailer");
        require(
            _id == medicines[_medicineID].retId,
            "Only correct retailer can mark medicine as sold"
        );
        require(
            medicines[_medicineID].stage == Stage.Retail,
            "Medicine not in Retail stage"
        );
        medicines[_medicineID].stage = Stage.Sold;
        medicines[_medicineID].timestamp = block.timestamp;
        emit StageChanged(_medicineID, Stage.Sold, msg.sender, block.timestamp);
    }

    function addMedicine(
        string memory _name,
        string memory _description
    ) public onlyOwner {
        require(
            (rmsCount > 0) &&
                (manufacturerCount > 0) &&
                (distributorCount > 0) &&
                (retailerCount > 0),
            "Supply chain participants not all registered"
        );
        medicineCount++;
        medicines[medicineCount] = Medicine(
            medicineCount,
            _name,
            _description,
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
