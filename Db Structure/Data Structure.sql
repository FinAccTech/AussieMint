IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='IntToDate') BEGIN DROP FUNCTION IntToDate END
GO
CREATE FUNCTION IntToDate(@IntDate INT)
RETURNS DATE
AS
BEGIN	
	RETURN  CAST (SUBSTRING(CAST(@IntDate AS VARCHAR),1,4)  + '-' + SUBSTRING(CAST(@IntDate AS VARCHAR),5,2) + '-' +  SUBSTRING(CAST(@IntDate AS VARCHAR),7,2) AS DATE)
END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='DateToInt') BEGIN DROP FUNCTION DateToInt END
GO
CREATE FUNCTION DateToInt(@DateInt DATE)
RETURNS INT
AS
BEGIN	
	RETURN  CAST(
            CAST(YEAR(@DateInt) AS VARCHAR) +
            CASE WHEN LEN(CAST(MONTH(@DateInt) AS VARCHAR)) = 1 THEN '0' + CAST(MONTH(@DateInt) AS VARCHAR) ELSE CAST(MONTH(@DateInt) AS VARCHAR) END  +
            CASE WHEN LEN(CAST(DAY(@DateInt) AS VARCHAR)) = 1 THEN '0' + CAST(DAY(@DateInt) AS VARCHAR) ELSE CAST(DAY(@DateInt) AS VARCHAR) END
          AS INT)
END
GO

CREATE TABLE Companies 
(
	CompSno INT PRIMARY KEY IDENTITY(1,1),	
	Comp_Code VARCHAR(20),
	Comp_Name VARCHAR(50),
	Fin_From INT,
	Fin_To INT,
	Books_From INT,
	Address1 VARCHAR(50),
	Address2 VARCHAR(50),
	Address3 VARCHAR(50),
	City VARCHAR(50),
	State VARCHAR(50),
	Pincode VARCHAR(10),
	Email VARCHAR(50),
	Phone VARCHAR(20),
	License_No VARCHAR(50),
	Hide_Status TINYINT,
	App_Version INT,
	Db_Version INT,
	Status BIT,	
	CommMasters BIT	
)
GO


CREATE TABLE Voucher_Types
(
  VouTypeSno INT PRIMARY KEY IDENTITY(1,1),
  VouType_Name VARCHAR(20),
)
GO



INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Opening')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Receipt')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Payment')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Journal')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Contra')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Memorandum')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Credit Note')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Debit Note')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Cheque RETURN')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Purchase Order')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Buying Contract')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('RCTI')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Sales Order')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Delivery Doc')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Sales Invoice')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Melting Issue')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Melting Receipt')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Refining Issue')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Refining Receipt')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Casting Issue')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Casting Receipt')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Jobwork Inward')
INSERT INTO Voucher_Types(VouType_Name)  VALUES ('Jobwork Delivery')

GO



CREATE TABLE Transaction_Setup
(
  SetupSno            INT IDENTITY(1,1),
  CompSno             INT,
  
  AreaCode_AutoGen    BIT,
  AreaCode_Prefix     CHAR(4),
  AreaCode_CurrentNo   INT,

  ClientCode_AutoGen   BIT,
  ClientCode_Prefix    CHAR(4),
  ClientCode_CurrentNo  INT,

  GrpCode_AutoGen     BIT,
  GrpCode_Prefix      CHAR(4),
  GrpCode_CurrentNo    INT,

  ItemCode_AutoGen    BIT,
  ItemCode_Prefix     CHAR(4),
  ItemCode_CurrentNo   INT,

  UomCode_AutoGen    BIT,
  UomCode_Prefix     CHAR(4),
  UomCode_CurrentNo   INT,

  Images_Mandatory    BIT,
  
  Allow_DuplicateItems  BIT,
  Disable_AddLess       BIT,
  Entries_LockedUpto    INT,
  Enable_Authentication BIT,
  Enable_OldEntries     BIT,  
  MobileNumberMandatory BIT
)
GO

CREATE TABLE Users
(
	UserSno INT PRIMARY KEY IDENTITY(1,1),
	UserName VARCHAR(20),
	Password VARCHAR(10),
	User_Type TINYINT,
	Active_Status BIT,
	Profile_Image VARCHAR(200),
	Image_Name VARCHAR(50),
	Enable_WorkingHours BIT,
	FromTime VARCHAR(10),
	ToTime VARCHAR(10)
)
GO

INSERT INTO Users (UserName,Password,User_Type, Active_Status)
VALUES ('Admin','sysdba',1,1)

CREATE TABLE Comp_Rights
(
  RightsSno INT PRIMARY KEY IDENTITY(1,1),
  UserSno INT,
  CompSno INT,
  Comp_Right BIT
)
GO

CREATE TABLE User_Rights
(
  RightSno INT PRIMARY KEY IDENTITY(1,1),
  UserSno INT,
  FormSno INT,
  View_Right BIT,
  Edit_Right BIT,
  Print_Right BIT,
  Delete_Right BIT,
  Create_Right BIT,
  Report_Right BIT,
  Date_Access BIT,
  Search_Access BIT,
)
GO


CREATE TABLE Voucher_Series
(
  SeriesSno INT PRIMARY KEY IDENTITY(1,1),
  VouTypeSno INT,
  Series_Name VARCHAR(20),
  Num_Method TINYINT,
  Allow_Duplicate BIT,
  Start_No INT,
  Current_No INT,
  Prefix CHAR(4),
  Suffix CHAR(3),
  Width TINYINT,
  Prefill VARCHAR(1),  
  Print_Voucher BIT,
  Print_On_Save BIT,
  Show_Preview BIT,
  Print_Style VARCHAR(100),
  IsDefault         BIT,
  IsStd				BIT,
  Active_Status     BIT,
  Create_Date       INT,
  UserSno           INT,
  CompSno           INT,
  BranchSno         INT
)
GO


CREATE TABLE Item_Groups
(
	GrpSno INT PRIMARY KEY IDENTITY(1,1),
	Grp_Code VARCHAR(20),
	Grp_Name VARCHAR(50),
	Market_Rate MONEY,
	Remarks VARCHAR(100),
	Active_Status BIT,
	Create_Date INT,
	UserSno INT,
	CompSno INT
)
GO


CREATE TABLE Ledger_Groups
(
  GrpSno INT PRIMARY KEY IDENTITY(1,1),
  Grp_Code VARCHAR(20),
  Grp_Name VARCHAR(50),
  Grp_Under INT,
  Grp_Level INT,
  Grp_Desc VARCHAR(200),
  Grp_Nature TINYINT,
  Affect_Gp BIT,
  Remarks VARCHAR(100),
  IsStd BIT,
  Created_Date INT
)

GO

CREATE TABLE Companies_Ledger_Groups
(
  GrpSno INT PRIMARY KEY IDENTITY(1,1),
  Grp_Code VARCHAR(20),
  Grp_Name VARCHAR(50),
  Grp_Under INT,
  Grp_Level INT,
  Grp_Desc VARCHAR(200),
  Grp_Nature TINYINT,
  Affect_Gp BIT,
  Remarks VARCHAR(100),
  IsStd BIT,
  Created_Date INT,
  CompSno INT
)

GO

	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Primary','Primary',1,0,'G001G',0,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('CapitalAccount','Capital Account',1,1,'G001GG002G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Loans(Liability)','Loans(Liability)',1,1,'G001GG003G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('CurrentLiabilities','Current Liabilities',1,1,'G001GG004G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('FixedAssets','Fixed Assets',1,1,'G001GG005G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Investments','Investments',1,1,'G001GG006G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('CurrentAssets','Current Assets',1,1,'G001GG007G',2,0,'',1, [dbo].DateToInt(GETDATE())    )
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Branch/Divisions','Branch / Divisions',1,1,'G001GG008G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Misc.Expenses(Asset)','Misc.Expenses(Asset)',1,1,'G001GG009G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SuspenseA/c','Suspense A/c',1,1,'G001GG010G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Reserves&Surplus','Reserves & Surplus',2,2,'G001GG002GG011G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('BankODA/c','Bank OD A/c',3,2,'G001GG003GG012G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SecuredLoans','Secured Loans',3,2,'G001GG003GG013G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('UnSecuredLoans','UnSecured Loans',3,2,'G001GG003GG014G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Duties&Taxes','Duties & Taxes',4,2,'G001GG004GG015G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Provisions','Provisions',4,2,'G001GG004GG016G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SundryCreditors','Sundry Creditors',4,2,'G001GG004GG017G',1,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('StockinHand','Stock in Hand',7,2,'G001GG007GG018G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Deposits(Asset)','Deposits (Asset)',7,2,'G001GG007GG019G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Loans&Adv(Asset)','Loans&Adv(Asset)',7,2,'G001GG007GG020G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SundryDebtors','Sundry Debtors',7,2,'G001GG007GG021G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('CashInHand','Cash In Hand',7,2,'G001GG007GG022G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('BankAccounts','Bank Accounts',7,2,'G001GG007GG023G',2,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('SalesAccounts','Sales Accounts',1,1,'G001GG024G',4,1,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('PurchaseAccounts','Purchase Accounts',1,1,'G001GG025G',3,1,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('DirectIncomes','Direct Incomes',1,1,'G001GG026G',4,1,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('DirectExpenses','Direct Expenses',1,1,'G001GG027G',3,1,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('IndirectIncomes','Indirect Incomes',1,1,'G001GG028G',4,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('IndirectExpenses','Indirect Expenses',1,1,'G001GG029G',3,0,'',1, [dbo].DateToInt(GETDATE()))
	INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Agent/Broker','Agent/Broker',1,1,'G001GG030G',1,0,'',1, [dbo].DateToInt(GETDATE()))
  INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('Loan Party(s)','Loan Party(s)',7,2,'G001GG007GG031G',2,0,'',1, [dbo].DateToInt(GETDATE()))
  INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_nature,Affect_Gp,Remarks,IsStd,Created_Date) VALUES ('RePledge Party(s)','RePledge Party(s)',4,2,'G001GG004GG033G',2,0,'',1, [dbo].DateToInt(GETDATE()))

  GO

  
CREATE TABLE Ledgers
(
  LedSno INT PRIMARY KEY IDENTITY(1,1),
  Led_Code VARCHAR(20),
  Led_Name VARCHAR(50), 
  GrpSno INT,
  OpenSno INT,
  Led_Desc VARCHAR(200),
  IsStd BIT,
  Std_No INT,
  Created_Date INT,
  CompSno INT,
  UserSno INT
)  -- Ledger Master defaults  will be inserted when company is created using sp_insertdefaults procedure
GO

CREATE TABLE Vouchers
(
  VouSno INT PRIMARY KEY IDENTITY(1,1),
  VouTypeSno INT,
  SeriesSno INT,
  Vou_No VARCHAR(20),
  Vou_Date INT,  
  Narration VARCHAR(100),
  TrackSno INT,
  IsAuto BIT,
  GenType TINYINT,
  UserSno INT,
  CompSno INT
)

GO

CREATE TABLE Voucher_Details
(
  DetSno INT PRIMARY KEY IDENTITY(1,1),
  VouSno INT,
  LedSno INT,
  Debit MONEY,
  Credit MONEY  
)
GO

CREATE TABLE Status_Updation
(
	StatusSno INT PRIMARY KEY IDENTITY(1,1),
	Updation_Date INT,
	Updation_Type TINYINT,  -- 1-Approval Status, 2-Cancel Status
  Document_Type TINYINT, -- 1-Loan, 2-Voucher .....
	TransSno INT,
	UserSno INT,
	Remarks VARCHAR(50)
)
GO

CREATE TABLE Area
(
	AreaSno INT PRIMARY KEY IDENTITY(1,1),
	Area_Code VARCHAR(20),
	Area_Name VARCHAR(50),
	Remarks VARCHAR(100),
	Active_Status BIT,
	Create_Date INT,
	UserSno INT,
	CompSno INT
)
GO

CREATE TABLE Items
(
	ItemSno INT PRIMARY KEY IDENTITY(1,1),
	Item_Code VARCHAR(20),
	Item_Name VARCHAR(50),
	GrpSno INT,
	Remarks VARCHAR(100),
	Active_Status BIT,
	Create_Date INT,
	UserSno INT,
	CompSno INT
)
GO


CREATE TABLE Uom
(
	UomSno INT PRIMARY KEY IDENTITY(1,1),
	Uom_Code VARCHAR(10),
	Uom_Name VARCHAR(20),
	BaseUomSno INT,
	Base_Qty DECIMAL(7,2),
	Active_Status BIT,
	Remarks VARCHAR(100),
	Create_Date INT,
	UserSno INT,
	CompSno INT
)
GO

CREATE TABLE Client
(
	ClientSno INT PRIMARY KEY IDENTITY(1,1),
	Client_Code VARCHAR(10),
	Client_Name VARCHAR(50),
	Address VARCHAR(200),
	City VARCHAR(50),
	Pincode VARCHAR(20),
	State VARCHAR(50),
	Mobile VARCHAR(50),
	Client_Type TINYINT,
	Client_Cat TINYINT,
	Sex TINYINT,
	Dob INT,
	Create_Date INT,
	Issue_Date INT,
	Expiry_Date INT,
	Email VARCHAR(50),
	Id_Number VARCHAR(50),
	Gst_Number VARCHAR(50),
	Director_Name VARCHAR(50),
	Remarks VARCHAR(100),
	AreaSno INT,
	Blocked BIT,
	UserSno INT,
	CompSno INT
)
GO

CREATE TABLE  Image_Details
(
  DetSno INT PRIMARY KEY IDENTITY(1,1),
  TransSno    INT,
  Image_Grp   TINYINT,   /* 1- Party Images 2-Other Images */
  Image_Name  VARCHAR(50),
  Image_Url   VARCHAR(100),
  CompSno     INT
)
GO
