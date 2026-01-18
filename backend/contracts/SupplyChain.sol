// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SupplyChain {
    // Smart Contract owner will be the person who deploys the contract only he can authorize various roles like retailer, Manufacturer, etc
    address public owner;

    // note this constructor will be called when smart contract will be deployed on blockchain
    constructor() {
        owner = msg.sender;
    }

    // Roles (flow of pharma supply chain)
    // RawMaterialSupplier; // This is where Manufacturer will get raw materials to make medicines
    // Manufacturer;  // Various WHO guidelines should be followed by this person
    // Distributor; // This guy distributes the medicines to retailers
    // Retailer; // Normal customer buys from the retailer

    // modifier to make sure only the owner is using the function
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

    // stages of a medicine in pharma supply chain
    enum Stage {
        Init,
        RawMaterialSupply,
        Manufacture,
        Distribution,
        Retail,
        Sold
    }

    // Medicine count
    uint256 public medicineCount = 0;
    // Raw material supplier count
    uint256 public rmsCount = 0;
    // Manufacturer count
    uint256 public manufacturerCount = 0;
    // distributor count
    uint256 public distributorCount = 0;
    // retailer count
    uint256 public retailerCount = 0;

    // To store information about the medicine
    struct Medicine {
        uint256 id; // unique medicine id
        string name; // name of the medicine
        string description; // about medicine
        uint256 rmsId; // id of the Raw Material supplier for this particular medicine
        uint256 manId; // id of the Manufacturer for this particular medicine
        uint256 disId; // id of the distributor for this particular medicine
        uint256 retId; // id of the retailer for this particular medicine
        Stage stage; // current medicine stage
        uint256 timestamp; // timestamp of the last stage change
    }

    // To store all the medicines on the blockchain
    mapping(uint256 => Medicine) public medicines;

    // To show status to client applications
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

    // To store information about raw material supplier
    struct RawMaterialSupplier {
        address addr;
        uint256 id; // supplier id
        string name; // Name of the raw material supplier
        string place; // Place the raw material supplier is based in
    }

    // To store all the raw material suppliers on the blockchain
    mapping(uint256 => RawMaterialSupplier) public rawMaterialSuppliers;

    // To store information about manufacturer
    struct Manufacturer {
        address addr;
        uint256 id; // manufacturer id
        string name; // Name of the manufacturer
        string place; // Place the manufacturer is based in
    }

    // To store all the manufacturers on the blockchain
    mapping(uint256 => Manufacturer) public manufacturers;

    // To store information about distributor
    struct Distributor {
        address addr;
        uint256 id; // distributor id
        string name; // Name of the distributor
        string place; // Place the distributor is based in
    }

    // To store all the distributors on the blockchain
    mapping(uint256 => Distributor) public distributors;

    // To store information about retailer
    struct Retailer {
        address addr;
        uint256 id; // retailer id
        string name; // Name of the retailer
        string place; // Place the retailer is based in
    }

    // To store all the retailers on the blockchain
    mapping(uint256 => Retailer) public retailers;

    // To add raw material suppliers. Only contract owner can add a new raw material supplier
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

    // To add manufacturer. Only contract owner can add a new manufacturer
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

    // To add distributor. Only contract owner can add a new distributor
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

    // To add retailer. Only contract owner can add a new retailer
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

    // To supply raw materials from RMS supplier to the manufacturer
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

    // To check if RMS is available in the blockchain
    function findRawMaterialSupplier(
        address _address
    ) private view returns (uint256) {
        for (uint256 i = 1; i <= rmsCount; i++) {
            if (rawMaterialSuppliers[i].addr == _address)
                return rawMaterialSuppliers[i].id;
        }
        return 0;
    }

    // To manufacture medicine
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

    // To check if Manufacturer is available in the blockchain
    function findManufacturer(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= manufacturerCount; i++) {
            if (manufacturers[i].addr == _address) return manufacturers[i].id;
        }
        return 0;
    }

    // To supply medicines from Manufacturer to distributor
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

    // To check if distributor is available in the blockchain
    function findDistributor(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= distributorCount; i++) {
            if (distributors[i].addr == _address) return distributors[i].id;
        }
        return 0;
    }

    // To supply medicines from distributor to retailer
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

    // To check if retailer is available in the blockchain
    function findRetailer(address _address) private view returns (uint256) {
        for (uint256 i = 1; i <= retailerCount; i++) {
            if (retailers[i].addr == _address) return retailers[i].id;
        }
        return 0;
    }

    // To sell medicines from retailer to consumer
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

    // To add new medicines to the stock
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
