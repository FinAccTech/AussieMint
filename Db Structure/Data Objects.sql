IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='PreFillString') BEGIN DROP FUNCTION PreFillString END
GO
CREATE FUNCTION [dbo].[PreFillString](@Input INT,@Digit INT)
  RETURNS VARCHAR(20)
WITH ENCRYPTION
AS
  BEGIN
    DECLARE @Result VARCHAR(20)
    If Len(@Input)< @Digit
      SET @Result =  Right('000000000' + Cast( @Input AS VARCHAR ), @Digit )
    ELSE
      SET @Result = @Input
    RETURN @Result
  END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='GenerateVoucherNo') BEGIN DROP FUNCTION GenerateVoucherNo END
GO

CREATE FUNCTION [dbo].[GenerateVoucherNo](@SeriesSno INT)
    RETURNS VARCHAR(20)
    WITH ENCRYPTION AS 
        BEGIN
         DECLARE @NewValue   VARCHAR(20)
         DECLARE @Prefix     VARCHAR(4)
         DECLARE @Suffix     VARCHAR(4)
         DECLARE @Width      TINYINT
         DECLARE @Prefill    VARCHAR
         DECLARE @Start_No   Numeric
         DECLARE @Current_No Numeric
         
         SELECT  @Prefix=Prefix,@Suffix=Suffix,@Width=Width,@Prefill=Prefill,@Start_No=Start_No,@Current_No=Current_No
         FROM    Voucher_Series
         WHERE   SeriesSno=@SeriesSno

         If @Current_No = 0 
            BEGIN
                SET @Current_No=@Start_No
            END
          ELSE
            BEGIN
                SET @Current_No=@Current_No+1
            END

             SET @NewValue = @Current_No
             SET @NewValue = RTrim(@Prefix) + Rtrim(@Newvalue) + RTrim(@Suffix)
              IF @Width <> 0
                 BEGIN
                     SET @NewValue = RTrim(@Prefix) + Right('000000000000000000' + Cast(@Current_No AS VARCHAR),@Width)
                     SET @NewValue=  Rtrim(@Newvalue) + RTrim(@Suffix)
                 END
              RETURN  @NewValue
        END
  GO


  IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Companies') BEGIN DROP PROCEDURE Sp_Companies END
GO
  
  CREATE PROCEDURE Sp_Companies
	@CompSno INT,	
	@Comp_Code VARCHAR(20),
	@Comp_Name VARCHAR(50),
	@Fin_From INT,
	@Fin_To INT,
	@Books_From INT,
	@Address1 VARCHAR(50),
	@Address2 VARCHAR(50),
	@Address3 VARCHAR(50),
	@City VARCHAR(50),
	@State VARCHAR(50),
	@Pincode VARCHAR(10),
	@Email VARCHAR(50),
	@Phone VARCHAR(20),
	@License_No VARCHAR(50),
	@Hide_Status TINYINT,
	@App_Version INT,
	@Db_Version INT,
	@Status BIT,	
	@CommMasters BIT,
  @RetSno	INT OUTPUT  

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		IF EXISTS(SELECT CompSno FROM Companies WHERE CompSno=@CompSno)
			BEGIN
				UPDATE Companies SET  Comp_Code = @Comp_Code ,Comp_Name = @Comp_Name ,Fin_From = @Fin_From ,Fin_To = @Fin_To ,Books_From = @Books_From ,Address1 = @Address1 ,Address2 = @Address2 ,
	                            Address3 = @Address3 ,City = @City ,State = @State ,Pincode = @Pincode ,Email = @Email ,Phone = @Phone ,License_No = @License_No ,Hide_Status = @Hide_Status ,App_Version = @App_Version,
	                            Db_Version = @Db_Version ,	Status = @Status ,CommMasters = @CommMasters 
				WHERE                 CompSno=@CompSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN
        INSERT INTO Companies (Comp_Code ,Comp_Name ,Fin_From ,Fin_To ,Books_From ,Address1 ,Address2 ,Address3 ,City ,State ,Pincode ,Email ,Phone ,License_No ,Hide_Status ,App_Version ,
	                              Db_Version ,	Status ,	CommMasters )
        VALUES                (@Comp_Code ,@Comp_Name ,@Fin_From ,@Fin_To ,@Books_From ,@Address1 ,@Address2 ,@Address3 ,@City ,@State ,@Pincode ,@Email ,@Phone ,@License_No ,@Hide_Status ,
                                @App_Version ,@Db_Version ,	@Status ,@CommMasters)					
				SET @CompSno = @@IDENTITY
        IF @@ERROR <> 0 GOTO CloseNow							

        SET @Comp_Code = 'COMP'+CAST( DAY(GETDATE()) AS VARCHAR) + CAST( MONTH(GETDATE()) AS VARCHAR) + CAST( YEAR(GETDATE()) AS VARCHAR) + CAST(@CompSno AS VARCHAR)
        UPDATE Companies SET Comp_Code=@Comp_Code WHERE CompSno=@CompSno
        IF @@ERROR <> 0 GOTO CloseNow
        
        EXEC Sp_InsertDefaults @CompSno
        
			END	  
	SET @RetSno = @CompSno
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Company_Delete') BEGIN DROP PROCEDURE Sp_Company_Delete END
GO

CREATE PROCEDURE Sp_Company_Delete
	@CompSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION		
			DELETE FROM Companies WHERE CompSno=@CompSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_User') BEGIN DROP PROCEDURE Sp_User END
GO

CREATE PROCEDURE Sp_User
	@UserSno INT,
  @UserName VARCHAR(10),
  @Password VARCHAR(20),
  @User_Type VARCHAR(50),
  @Active_Status BIT,
  @UserRightsXml XML,
  @CompRightsXml XML,
  @Profile_Image VARCHAR(200),
  @Image_Name VARCHAR(50),
  @Enable_WorkingHours BIT,
  @FromTime VARCHAR(10),
  @ToTime VARCHAR(10),
	@RetSno	INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    /*IF @UserSno = 1
      BEGIN
        Raiserror ('Admin User cannot be altered', 16, 1) 
        GOTO CloseNow
      END */

		IF EXISTS(SELECT UserSno FROM Users WHERE UserSno=@UserSno)
			BEGIN
				UPDATE Users SET  Password=@Password, User_Type=@User_Type,Active_Status=@Active_Status, Profile_Image=@Profile_Image, Image_Name=@Image_Name,
                          Enable_WorkingHours=@Enable_WorkingHours, FromTime=@FromTime, ToTime=@ToTime
				WHERE UserSno=@UserSno
				IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Comp_Rights WHERE UserSno = @UserSno
        IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM User_Rights WHERE UserSno = @UserSno
        IF @@ERROR <> 0 GOTO CloseNow
			END
		ELSE
			BEGIN          
        IF EXISTS(SELECT UserSno FROM Users WHERE UserName=@UserName)
          BEGIN
              Raiserror ('User exists with this Name', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Users(UserName, Password, User_Type,Active_Status,Profile_Image,Image_Name,Enable_WorkingHours,FromTime,ToTime)
        VALUES           (@UserName, @Password, @User_Type,@Active_Status,@Profile_Image,@Image_Name,@Enable_WorkingHours,@FromTime,@ToTime)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @UserSno = @@IDENTITY
			END

      IF @UserRightsXml IS NOT NULL
        BEGIN
      --INSERTING INTO USER RIGHT TABLE
             DECLARE @idoc       INT
             DECLARE @Sno        INT
             DECLARE @doc        XML
             DECLARE @FormSno    FLOAT
             DECLARE @View_Right     BIT
             DECLARE @Edit_Right     BIT
             DECLARE @Print_Right    BIT
             DECLARE @Delete_Right   BIT
             DECLARE @Create_Right   BIT
             DECLARE @Report_Right   BIT
             DECLARE @Date_Access    BIT
             DECLARE @Search_Access  BIT
        
        /*Declaring temporary table for User Rights*/
              DECLARE @RightsTable TABLE
                 (
                     Sno INT IDENTITY(1,1), FormSno INT, View_Right BIT,
                     Edit_Right BIT,Delete_Right BIT,Create_Right BIT,Print_Right BIT,Report_Right BIT,Date_Access BIT, Search_Access BIT
                 )
        
              SET @doc=@UserRightsXml
              EXEC Sp_Xml_Preparedocument @idoc Output, @doc
        
        /*Inserting into Temp User Rights Table FROM passed XML File*/
              INSERT INTO @RightsTable
                 (
                 FormSno,View_Right,Edit_Right,Print_Right,Delete_Right,Create_Right,Report_Right,Date_Access,Search_Access
                 )
              SELECT  * FROM  OpenXml 
                 (
                 @idoc, '/ROOT/Users/User_Rights',2
                 )
                     WITH 
                 (
                 FormSno INT '@FormSno',View_Right BIT '@VR',Edit_Right BIT '@ER',Print_Right BIT '@PR',Delete_Right BIT '@DR',Create_Right BIT '@CR',Report_Right BIT '@RR',Date_Access BIT '@DA',Search_Access BIT '@SA'
                 )
              SELECT Top 1   @Sno=Sno,@FormSno=FormSno,@View_Right=View_Right,
                         @Edit_Right=Edit_Right,@Delete_Right=Delete_Right,@Create_Right=Create_Right,
                         @Print_Right=Print_Right,@Report_Right=Report_Right,@Date_Access=Date_Access,@Search_Access=Search_Access
              FROM       @RightsTable
        
        /*Inserting into User Rights table FROM Temp Table*/
              While @@RowCount <> 0 
                  BEGIN
                      INSERT into User_Rights(UserSno,FormSno,View_Right,Edit_Right,Print_Right,Delete_Right,Create_Right,Report_Right,Date_Access,Search_Access) 
                      Values(@UserSno,@FormSno,@View_Right,@Edit_Right,@Print_Right,@Delete_Right,@Create_Right,@Report_Right,@Date_Access,@Search_Access)
                      If @@Error <> 0 Goto CloseNow
                      DELETE From @RightsTable WHERE Sno = @Sno
              SELECT Top 1   @Sno=Sno,@FormSno=FormSno,@View_Right=View_Right,
                         @Edit_Right=Edit_Right,@Delete_Right=Delete_Right,@Create_Right=Create_Right,
                         @Print_Right=Print_Right,@Report_Right=Report_Right,@Date_Access=Date_Access,@Search_Access=Search_Access
              From       @RightsTable
                  END
        
              Exec Sp_Xml_Removedocument @idoc
          END
          
      IF @CompRightsXml IS NOT NULL
        BEGIN
      --INSERTING INTO USER RIGHT TABLE
             
             DECLARE @CompSno    FLOAT
             DECLARE @Comp_Right     BIT
                     
        /*Declaring temporary table for User Rights*/
              DECLARE @CompRightsTable TABLE
                 (
                     Sno INT IDENTITY(1,1), CompSno INT, Comp_Right BIT                     
                 )
        
              SET @doc=@CompRightsXml
              EXEC Sp_Xml_Preparedocument @idoc Output, @doc
        
        /*Inserting into Temp User Rights Table FROM passed XML File*/
              INSERT INTO @CompRightsTable
                 (
                 CompSno,Comp_Right
                 )
              SELECT  * FROM  OpenXml 
                 (
                 @idoc, '/ROOT/Companies/Comp_Rights',2
                 )
                     WITH 
                 (
                 CompSno INT '@CompSno', Comp_Right BIT '@Comp_Right'
                 )
              SELECT Top 1   @Sno=Sno,@CompSno=CompSno,@Comp_Right=Comp_Right                         
              FROM           @CompRightsTable
        
        /*Inserting into User Rights table FROM Temp Table*/
              While @@RowCount <> 0 
                  BEGIN
                      INSERT into Comp_Rights(UserSno,CompSno,Comp_Right) 
                      Values(@UserSno,@CompSno,@Comp_Right)

                      If @@Error <> 0 Goto CloseNow
                      DELETE From @CompRightsTable WHERE Sno = @Sno

                      SELECT Top 1   @Sno=Sno,@CompSno=CompSno,@Comp_Right=Comp_Right                         
                      FROM           @CompRightsTable
                  END
        
              Exec Sp_Xml_Removedocument @idoc
          END

      SET @RetSno = @UserSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getUsers') BEGIN DROP FUNCTION Udf_getUsers END
GO

CREATE FUNCTION Udf_getUsers(@UserSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT    Usr.*,            
            ISNULL((SELECT * FROM User_Rights WHERE UserSno = Usr.UserSno FOR JSON PATH),'') as Rights_Json,
            ISNULL((SELECT Cr.*, Comp.Comp_Name FROM Comp_Rights Cr INNER JOIN Companies Comp ON Comp.CompSno=Cr.CompSno WHERE UserSno = Usr.UserSno FOR JSON PATH),'') as Comp_Rights_Json
            
  FROM      Users  Usr            
  WHERE     (Usr.UserSno=@UserSno OR @UserSno=0) 

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_User_Delete') BEGIN DROP PROCEDURE Sp_User_Delete END
GO
CREATE PROCEDURE Sp_User_Delete
	@UserSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    IF @UserSno = 1
      BEGIN
      Raiserror ('You cannot delete a Admin User', 16, 1) 
					GOTO CloseNow
      END

			IF EXISTS (SELECT UserSno FROM Transactions WHERE UserSno=@UserSno)
				BEGIN
					Raiserror ('Transactions exists with this User', 16, 1) 
					GOTO CloseNow
				END 

			DELETE FROM Users WHERE UserSno=@UserSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Transaction_Setup') BEGIN DROP PROCEDURE Sp_Transaction_Setup END
GO

CREATE PROCEDURE Sp_Transaction_Setup
	@SetupSno            INT,
  @CompSno             INT,
  
  @AreaCode_AutoGen    BIT,
  @AreaCode_Prefix     CHAR(4),
  @AreaCode_CurrentNo   INT,

  @ClientCode_AutoGen   BIT,
  @ClientCode_Prefix    CHAR(4),
  @ClientCode_CurrentNo  INT,

  
  @GrpCode_AutoGen     BIT,
  @GrpCode_Prefix      CHAR(4),
  @GrpCode_CurrentNo    INT,

  @ItemCode_AutoGen    BIT,
  @ItemCode_Prefix     CHAR(4),
  @ItemCode_CurrentNo   INT,

  @UomCode_AutoGen    BIT,
  @UomCode_Prefix     CHAR(4),
  @UomCode_CurrentNo   INT,
    
  @Images_Mandatory    BIT,
  
  @Allow_DuplicateItems  BIT,
  @Disable_AddLess       BIT,
  @Entries_LockedUpto    INT,
  @Enable_Authentication BIT,
  @Enable_OldEntries     BIT,  
  @MobileNumberMandatory BIT

  
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		
			BEGIN
				UPDATE Transaction_Setup SET  AreaCode_AutoGen = @AreaCode_AutoGen, AreaCode_Prefix = @AreaCode_Prefix, AreaCode_CurrentNo = @AreaCode_CurrentNo,
                                      ClientCode_AutoGen = @ClientCode_AutoGen, ClientCode_Prefix = @ClientCode_Prefix, ClientCode_CurrentNo = @ClientCode_CurrentNo,                                      
                                      GrpCode_AutoGen = @GrpCode_AutoGen, GrpCode_Prefix = @GrpCode_Prefix, GrpCode_CurrentNo = @GrpCode_CurrentNo, 
									                    ItemCode_AutoGen = @ItemCode_AutoGen, ItemCode_Prefix = @ItemCode_Prefix, ItemCode_CurrentNo = @ItemCode_CurrentNo,
                                      UomCode_AutoGen = @UomCode_AutoGen, UomCode_Prefix = @UomCode_Prefix, UomCode_CurrentNo = @UomCode_CurrentNo,
                                      Images_Mandatory = @Images_Mandatory,Allow_DuplicateItems = @Allow_DuplicateItems, Disable_AddLess = @Disable_AddLess, Entries_LockedUpto = @Entries_LockedUpto,
                                      Enable_Authentication = @Enable_Authentication, Enable_OldEntries= @Enable_OldEntries, MobileNumberMandatory=@MobileNumberMandatory
				WHERE  SetupSno=@SetupSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END

	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getTransaction_Setup') BEGIN DROP FUNCTION Udf_getTransaction_Setup END
GO

CREATE FUNCTION Udf_getTransaction_Setup(@SetupSno INT, @CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT	*
	FROM	  Transaction_Setup
	WHERE	  (SetupSno=@SetupSno OR @SetupSno=0) AND (CompSno=@CompSno)

GO

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getVoucherTypes') BEGIN DROP FUNCTION Udf_getVoucherTypes END
GO

CREATE FUNCTION Udf_getVoucherTypes(@VouTypeSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT	VTyp.*, VTyp.VouType_Name as Name, VTyp.VouType_Name as Details
	FROM	  Voucher_Types VTyp
	WHERE	  VouTypeSno=@VouTypeSno OR @VouTypeSno = 0

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Voucher_Series') BEGIN DROP PROCEDURE Sp_Voucher_Series END
GO

CREATE PROCEDURE Sp_Voucher_Series
	@SeriesSno          INT,
  @VouTypeSno         INT,
  @Series_Name        VARCHAR(20),  
  @Num_Method         TINYINT, -- 0- MANUAL,  1- SEMI,  2- AUTO
  @Allow_Duplicate    BIT,
  @Start_No           INT,
  @Current_No         INT,
  @Prefix             CHAR(4),
  @Suffix             CHAR(3),
  @Width              TINYINT,
  @Prefill            VARCHAR(1),  
  @Print_Voucher      BIT,
  @Print_On_Save      BIT,
  @Show_Preview       BIT,
  @Print_Style        VARCHAR(100),
  @IsStd              BIT,
  @IsDefault          BIT,
  @Active_Status      BIT,
  @Create_Date        INT,
  @UserSno            INT,
  @CompSno            INT,  
	@RetSno	            INT OUTPUT

WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
		IF EXISTS(SELECT SeriesSno FROM Voucher_Series WHERE SeriesSno=@SeriesSno)
			BEGIN

        UPDATE Voucher_Series SET VouTypeSno=@VouTypeSno, Series_Name=@Series_Name, Num_Method=@Num_Method, Allow_Duplicate=@Allow_Duplicate, Start_No=@Start_No, Current_No=@Current_No,
                                  Prefix=@Prefix, Suffix=@Suffix, Width=@Width, Prefill=@Prefill, Print_Voucher=@Print_Voucher, Print_On_Save=@Print_On_Save, Show_Preview=@Show_Preview, Print_Style=@Print_Style,
                                  Active_Status=@Active_Status, Create_Date=@Create_Date, UserSno=@UserSno, CompSno=@CompSno, IsDefault=@IsDefault, IsStd=@IsStd
				WHERE SeriesSno=@SeriesSno
				IF @@ERROR <> 0 GOTO CloseNow												
			END
		ELSE
			BEGIN
        IF EXISTS(SELECT SeriesSno FROM Voucher_Series WHERE  Series_Name=@Series_Name AND CompSno=@CompSno)
          BEGIN
              Raiserror ('Voucher Series exists with this Name.', 16, 1) 
              GOTO CloseNow
          END

				INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No, Current_No, Prefix, Suffix, Width, Prefill,Print_Voucher, Print_On_Save, Show_Preview, Print_Style,IsDefault,IsStd,
                                  Active_Status, Create_Date, UserSno, CompSno, BranchSno)
        VALUES (@VouTypeSno, @Series_Name, @Num_Method, @Allow_Duplicate, @Start_No, @Current_No, @Prefix, @Suffix, @Width, @Prefill, @Print_Voucher, @Print_On_Save, @Show_Preview, @Print_Style,@IsDefault,@IsStd,
                                  @Active_Status, @Create_Date, @UserSno, @CompSno, 1)
				IF @@ERROR <> 0 GOTO CloseNow								
				SET @SeriesSno = @@IDENTITY								
			END	

	SET @RetSno = @SeriesSno
	COMMIT TRANSACTION
	RETURN @RetSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getVoucherSeries') BEGIN DROP FUNCTION Udf_getVoucherSeries END
GO

CREATE FUNCTION Udf_getVoucherSeries(@SeriesSno INT,  @VouTypeSno INT, @CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN
	SELECT (
  SELECT	  Ser.*, VTyp.VouTypeSno as 'VouType.VouTypeSno',  VTyp.VouType_Name as 'VouType.VouType_Name',  VTyp.VouType_Name  as 'VouType.Name', VTyp.VouType_Name  as 'VouType.Details',
            VTyp.Stock_Type as 'VouType.Stock_Type',
            VTyp.Cash_Type as 'VouType.Cash_Type',
            Ser.Series_Name as Name, Ser.Series_Name as Details,
            VTyp.VouType_Name as VouType_Name
	          FROM	  Voucher_Series Ser
                    INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Ser.VouTypeSno
	          WHERE	  (Ser.SeriesSno=@SeriesSno OR @SeriesSno = 0) AND (Ser.VouTypeSno=@VouTypeSno OR @VouTypeSno=0)
                    AND (Ser.CompSno=@CompSno)                    
            ORDER BY Create_Date DESC
            FOR JSON PATH) AS Json_Result

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Voucher_Series_Delete') BEGIN DROP PROCEDURE Sp_Voucher_Series_Delete END
GO


CREATE PROCEDURE Sp_Voucher_Series_Delete
	@SeriesSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

  DECLARE @IsDefault BIT = 0
      SELECT @IsDefault = IsDefault FROM Voucher_Series WHERE SeriesSno=@SeriesSno

      IF @IsDefault = 1
        BEGIN
          Raiserror ('Standard Voucher Series cannot be deleted..', 16, 1) 
					GOTO CloseNow
        END

			IF EXISTS (SELECT TransSno FROM Transactions WHERE SeriesSno=@SeriesSno)
				BEGIN
					Raiserror ('Transactions exists with this Series', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Voucher_Series WHERE SeriesSno=@SeriesSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_InsertSeriesDefaults') BEGIN DROP PROCEDURE Sp_InsertSeriesDefaults END
GO
CREATE PROCEDURE Sp_InsertSeriesDefaults 
@CompSno INT
AS
BEGIN

  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd,  Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (1,'Opening',1,0,1,0,'OP','',4,0,0,0,0,'',1,1, 1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (2,'Receipt',1,0,1,0,'REC','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (3,'Payment',1,0,1,0,'PMT','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (4,'Journal',1,0,1,0,'JOU','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (5,'Contra',1,0,1,0,'CTR','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno,  CompSno, BranchSno)
  VALUES (6,'Memorandum',1,0,1,0,'MEM','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (7,'Credit Note',1,0,1,0,'CRN','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (8,'Debit Note',1,0,1,0,'DRN','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (9,'Cheque RETURN',1,0,1,0,'CRET','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (10,'Purchase Order',1,0,1,0,'PO','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (11,'Buying Contract',1,0,1,0,'BC','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (12,'RCTI',1,0,1,0,'BR','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (13,'Sales Order',1,0,1,0,'SO','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (14,'Delivery Doc',1,0,1,0,'DC','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (15,'Sales Invoice',1,0,1,0,'SI','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (16,'Melting Issue',1,0,1,0,'MI','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (17,'Melting Receipt',1,0,1,0,'MR','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (18,'Refining Issue',1,0,1,0,'RI','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (19,'Refining Receipt',1,0,1,0,'RR','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (20,'Casting Issue',1,0,1,0,'CI','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (21,'Casting Receipt',1,0,1,0,'CR','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (22,'Jobwork Inward',1,0,1,0,'JI','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (23,'Jobwork Delivery',1,0,1,0,'JD','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (24,'Advance Doc Purchase',1,0,1,0,'ADP','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (25,'Advance Doc Sales',1,0,1,0,'ADS','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (26,'Lab Testing Issue',1,0,1,0,'LTI','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (27,'Lab Testing Receipt',1,0,1,0,'LTR','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Voucher_Series(VouTypeSno, Series_Name, Num_Method, Allow_Duplicate, Start_No,  Current_No, Prefix, Suffix, Width, Prefill, Print_Voucher, Print_On_Save, Show_Preview, Print_Style, IsDefault, IsStd, Active_Status, Create_Date, UserSno, CompSno, BranchSno)
  VALUES (28,'GRN',1,0,1,0,'GRN','',4,0,0,0,0,'',1,1,1,dbo.DateToInt(GETDATE()),1,@CompSno,1)
END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_InsertDefaults') BEGIN DROP PROCEDURE Sp_InsertDefaults END
GO
CREATE PROCEDURE Sp_InsertDefaults
  @CompSno INT
AS
BEGIN
  
  
  EXEC Sp_InsertSeriesDefaults @CompSno

  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('','',1,0,'G001GL000L',1,0,@CompSno,1,1)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('CashA/c','Cash A/c',22,0,'G001GG007GG022GL000L',1,0,@CompSno,1,2)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Profit & Loss A/c','Profit & Loss A/c',1,0,'G001GL000L',1,0,@CompSno,1,3)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('InterestIncomeA/c','Interest Income A/c',26,0,'G001GG026GL000L',1,0,@CompSno,1,4)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('DocumentIncomeA/c','Document Income A/c',26,0,'G001GG026GL000L',1,0,@CompSno,1,5)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('DefaultIncomeA/c','Default Income A/c',26,0,'G001GG026GL000L',1,0,@CompSno,1,6)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Add/Less','Add/Less',26,0,'G001GG026GL000L',1,0,@CompSno,1,7)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('OtherIncomeA/c','Other Income A/c',4,0,'G001GG026GL000L',1,0,@CompSno,1,8)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Shortage&ExcessA/c','Shortage & Excess A/c',4,0,'G001GG004GL000L',1,0,@CompSno,1,9)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Interest PaidA/c','Interest Paid A/c',27,0,'G001GG027GL000L',1,0,@CompSno,1,10)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Bank ChargesA/c','Bank Charges A/c',27,0,'G001GG027GL000L',1,0,@CompSno,1,11)

  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Purchase A/c','Purchase A/c',25,0,'G001GG025GL000L',1,0,@CompSno,1,12)
  INSERT INTO  Ledgers(Led_Code, Led_Name, GrpSno, OpenSno, Led_Desc, IsStd, Created_Date, CompSno, UserSno,Std_No) VALUES ('Sales A/c','Sales A/c',24,0,'G001GG024GL000L',1,0,@CompSno,1,13)

  /* INSERTIN INTO Companies_Ledger_Groups For Each Companies for Accouting Purpose */

  INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Primary','Primary',1,0,'G001G',0,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('CapitalAccount','Capital Account',1,1,'G001GG002G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Loans(Liability)','Loans(Liability)',1,1,'G001GG003G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('CurrentLiabilities','Current Liabilities',1,1,'G001GG004G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('FixedAssets','Fixed Assets',1,1,'G001GG005G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Investments','Investments',1,1,'G001GG006G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('CurrentAssets','Current Assets',1,1,'G001GG007G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno    )
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Branch/Divisions','Branch / Divisions',1,1,'G001GG008G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Misc.Expenses(Asset)','Misc.Expenses(Asset)',1,1,'G001GG009G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SuspenseA/c','Suspense A/c',1,1,'G001GG010G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Reserves&Surplus','Reserves & Surplus',2,2,'G001GG002GG011G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('BankODA/c','Bank OD A/c',3,2,'G001GG003GG012G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SecuredLoans','Secured Loans',3,2,'G001GG003GG013G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('UnSecuredLoans','UnSecured Loans',3,2,'G001GG003GG014G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Duties&Taxes','Duties & Taxes',4,2,'G001GG004GG015G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Provisions','Provisions',4,2,'G001GG004GG016G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SundryCreditors','Sundry Creditors',4,2,'G001GG004GG017G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('StockinHand','Stock in Hand',7,2,'G001GG007GG018G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Deposits(Asset)','Deposits (Asset)',7,2,'G001GG007GG019G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Loans&Adv(Asset)','Loans&Adv(Asset)',7,2,'G001GG007GG020G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SundryDebtors','Sundry Debtors',7,2,'G001GG007GG021G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('CashInHand','Cash In Hand',7,2,'G001GG007GG022G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('BankAccounts','Bank Accounts',7,2,'G001GG007GG023G',2,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('SalesAccounts','Sales Accounts',1,1,'G001GG024G',4,1,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('PurchaseAccounts','Purchase Accounts',1,1,'G001GG025G',3,1,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('DirectIncomes','Direct Incomes',1,1,'G001GG026G',4,1,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('DirectExpenses','Direct Expenses',1,1,'G001GG027G',3,1,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('IndirectIncomes','Indirect Incomes',1,1,'G001GG028G',4,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('IndirectExpenses','Indirect Expenses',1,1,'G001GG029G',3,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
	INSERT INTO Companies_Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date, CompSno) VALUES ('Agent/Broker','Agent/Broker',1,1,'G001GG030G',1,0,'',1, [dbo].DateToInt(GETDATE()), @CompSno)
    
  INSERT INTO Area (Area_Code,Area_Name,Remarks,Active_Status,Create_Date,UserSno,CompSno) VALUES ('PRIMARY','PRIMARY','',1,dbo.DateToInt(GETDATE()),1,@CompSno)
  
  INSERT INTO Item_Groups(Grp_Code, Grp_Name, Market_Rate, Remarks, Active_Status, Create_Date, UserSno, CompSno)
  VALUES ('AU', 'GOLD',0, '', 1, dbo.DateToInt(GETDATE()), 1, @CompSno)
  INSERT INTO Item_Groups(Grp_Code, Grp_Name, Market_Rate, Remarks, Active_Status, Create_Date, UserSno, CompSno)
  VALUES ('AG', 'SILVER',0, '', 1, dbo.DateToInt(GETDATE()), 1, @CompSno)
  INSERT INTO Item_Groups(Grp_Code, Grp_Name, Market_Rate, Remarks, Active_Status, Create_Date, UserSno, CompSno)
  VALUES ('PD', 'PALLADIUM',0, '', 1, dbo.DateToInt(GETDATE()), 1, @CompSno)
  INSERT INTO Item_Groups(Grp_Code, Grp_Name, Market_Rate, Remarks, Active_Status, Create_Date, UserSno, CompSno)
  VALUES ('PT', 'PLATINUM',0, '', 1, dbo.DateToInt(GETDATE()), 1, @CompSno)


  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Require_LabTest, Active_Status, Create_Date, UserSno, CompSno,Remarks, IsStd)
  VALUES ('OG','Ornament Gold',1,0,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'',1)
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Require_LabTest, Active_Status, Create_Date, UserSno, CompSno,Remarks, IsStd)
  VALUES ('MB','Melted Bar',1,1,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'',1)
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Require_LabTest,Active_Status, Create_Date, UserSno, CompSno,Remarks, IsStd)
  VALUES ('RG','Refined Gold',1,0,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'',1)
  INSERT INTO Items(Item_Code, Item_Name, GrpSno,Require_LabTest, Active_Status, Create_Date, UserSno, CompSno,Remarks, IsStd)
  VALUES ('CB','Casted Bar',1,0,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'',1)
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Require_LabTest,Active_Status, Create_Date, UserSno, CompSno,Remarks, IsStd)
  VALUES ('SG','Sample Gold',1,0,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'',1)
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Require_LabTest,Active_Status, Create_Date, UserSno, CompSno,Remarks, IsStd)
  VALUES ('UG','Undissolved Gold',1,0,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'',1)
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Require_LabTest, Active_Status, Create_Date, UserSno, CompSno,Remarks, IsStd)
  VALUES ('AUAGCL','AU in Ag Chloride',1,0,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'',1)
  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Require_LabTest, Active_Status, Create_Date, UserSno, CompSno,Remarks, IsStd)
  VALUES ('REG','Recovery Gold',1,0,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'',1)

  INSERT INTO Items(Item_Code, Item_Name, GrpSno, Require_LabTest, Active_Status, Create_Date, UserSno, CompSno,Remarks, IsStd)
  VALUES ('AGS','Silver',2,0,1,[dbo].DateToInt(GETDATE()), 1,@CompSno,'',1)

  

  INSERT INTO Uom(Uom_Code, Uom_Name, BaseUomSno, Base_Qty, Active_Status, Remarks, Create_Date, UserSno, CompSno, IsStd)
  VALUES ('GMS','Grams',0,0,1,'',[dbo].DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Uom(Uom_Code, Uom_Name, BaseUomSno, Base_Qty, Active_Status, Remarks, Create_Date, UserSno, CompSno, IsStd)
  VALUES ('OUN','Ounce',1,31.1,1,'',[dbo].DateToInt(GETDATE()),1,@CompSno,1)
  INSERT INTO Uom(Uom_Code, Uom_Name, BaseUomSno, Base_Qty, Active_Status, Remarks, Create_Date, UserSno, CompSno, IsStd)
  VALUES ('KG','Kilogram',1,1000,1,'',[dbo].DateToInt(GETDATE()),1,@CompSno,1)

  INSERT INTO Transaction_Setup(      AreaCode_AutoGen, AreaCode_Prefix, AreaCode_CurrentNo, ClientCode_AutoGen,ClientCode_Prefix, ClientCode_CurrentNo, 
                                      GrpCode_AutoGen, GrpCode_Prefix, GrpCode_CurrentNo,
                                      ItemCode_AutoGen, ItemCode_Prefix, ItemCode_CurrentNo,
                                      UomCode_AutoGen, UomCode_Prefix, UomCode_CurrentNo, 
                                      Images_Mandatory, Allow_DuplicateItems, Disable_AddLess, Entries_LockedUpto, Enable_Authentication, Enable_OldEntries,
                                      CompSno,MobileNumberMandatory)

  VALUES                       (      1, 'AR', 0, 1,'PR', 0, 1, 'GRP', 0, 1, 'IT', 0,1,'UM',0,0,1,0,0,1,1, @CompSno,0)
    
END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Item_Groups' ) BEGIN DROP PROCEDURE Sp_Item_Groups END
GO

CREATE PROCEDURE Sp_Item_Groups
    @GrpSno INT,
    @Grp_Code VARCHAR(20),
    @Grp_Name VARCHAR(50),
    @Market_Rate MONEY,
    @Remarks VARCHAR(100),
    @Active_Status BIT,
    @Create_Date INT,
    @UserSno INT,
    @CompSno INT,
    @RetSno INT OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        IF EXISTS(SELECT GrpSno FROM Item_Groups WHERE GrpSno=@GrpSno)
            BEGIN
                UPDATE Item_Groups SET Grp_Code=@Grp_Code,Grp_Name=@Grp_Name,Market_Rate=@Market_Rate,Remarks=@Remarks,Active_Status=@Active_Status,Create_Date=@Create_Date,UserSno=@UserSno,CompSno=@CompSno
                WHERE GrpSno=@GrpSno
                IF @@ERROR <> 0 GOTO CloseNow
            End
        Else
            BEGIN

            DECLARE @GrpCode_AutoGen BIT
            SELECT @GrpCode_AutoGen=GrpCode_AutoGen FROM Transaction_Setup WHERE CompSno=@CompSno
            IF @GrpCode_AutoGen=1
            BEGIN
                SELECT @Grp_Code=TRIM(GrpCode_Prefix)+CAST((GrpCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE CompSno=@CompSno
            End

              IF EXISTS(SELECT GrpSno FROM Item_Groups WHERE  Grp_Code=@Grp_Code AND CompSno =@CompSno)
              BEGIN
                  Raiserror ('Item_Groups exists with this Code', 16, 1)
                  GoTo CloseNow
              End

             INSERT INTO Item_Groups(Grp_Code,Grp_Name,Market_Rate,Remarks,Active_Status,Create_Date,UserSno,CompSno)
             VALUES (@Grp_Code,@Grp_Name,@Market_Rate,@Remarks,@Active_Status,@Create_Date,@UserSno,@CompSno)
             IF @@ERROR <> 0 GOTO CloseNow
             SET @GrpSno = @@IDENTITY

             IF @GrpCode_AutoGen=1
              BEGIN
                UPDATE Transaction_Setup SET GrpCode_CurrentNo = GrpCode_CurrentNo + 1 WHERE CompSno=@CompSno
                IF @@ERROR <> 0 GOTO CloseNow
              END
            End

    SET @RetSno = @GrpSno
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getItem_Groups') BEGIN DROP FUNCTION Udf_getItem_Groups END
GO

CREATE FUNCTION Udf_getItem_Groups(@GrpSno INT,@CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return
    SELECT  Ig.*, Ig.Grp_Name as Name, 'Code: '+ Ig.Grp_Code as Details
    FROM      Item_Groups Ig
    WHERE     (GrpSno=@GrpSno OR @GrpSno = 0) AND (CompSno =@CompSno)

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Item_Groups_Delete') BEGIN DROP PROCEDURE Sp_Item_Groups_Delete END
GO

CREATE PROCEDURE Sp_Item_Groups_Delete
    @GrpSno INT
WITH ENCRYPTION AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
            DELETE FROM Item_Groups WHERE GrpSno=@GrpSno
            IF @@ERROR <> 0 GOTO CloseNow
    COMMIT TRANSACTION
    RETURN 1
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Area') BEGIN DROP PROCEDURE Sp_Area END
GO

CREATE PROCEDURE Sp_Area
    @AreaSno INT,
    @Area_Code VARCHAR(20),
    @Area_Name VARCHAR(50),
    @Remarks VARCHAR(100),
    @Active_Status BIT,
    @Create_Date INT,
    @UserSno INT,
    @CompSno INT,
    @RetSno INT OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        IF EXISTS(SELECT AreaSno FROM Area WHERE AreaSno=@AreaSno)
            BEGIN
                UPDATE Area SET Area_Code=@Area_Code,Area_Name=@Area_Name,Remarks=@Remarks,Active_Status=@Active_Status,Create_Date=@Create_Date,UserSno=@UserSno,CompSno=@CompSno
                WHERE AreaSno=@AreaSno
                IF @@ERROR <> 0 GOTO CloseNow
            End
        Else
            BEGIN

            DECLARE @AreaCode_AutoGen BIT
            SELECT @AreaCode_AutoGen=AreaCode_AutoGen FROM Transaction_Setup WHERE CompSno=@CompSno
            IF @AreaCode_AutoGen=1
            BEGIN
                SELECT @Area_Code=TRIM(AreaCode_Prefix)+CAST((AreaCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE CompSno=@CompSno
            End
              
              IF EXISTS(SELECT AreaSno FROM Area WHERE  Area_Code=@Area_Code AND CompSno =@CompSno)
                BEGIN
                    Raiserror ('Area exists with this Code', 16, 1)
                    GoTo CloseNow
                End

             INSERT INTO Area(Area_Code,Area_Name,Remarks,Active_Status,Create_Date,UserSno,CompSno)
             VALUES (@Area_Code,@Area_Name,@Remarks,@Active_Status,@Create_Date,@UserSno,@CompSno)
             IF @@ERROR <> 0 GOTO CloseNow
             SET @AreaSno = @@IDENTITY

             IF @AreaCode_AutoGen=1
              BEGIN
                UPDATE Transaction_Setup SET AreaCode_CurrentNo = AreaCode_CurrentNo + 1 WHERE CompSno=@CompSno
                IF @@ERROR <> 0 GOTO CloseNow
              END
            End

    SET @RetSno = @AreaSno
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getArea') BEGIN DROP FUNCTION Udf_getArea END
GO

CREATE FUNCTION Udf_getArea(@AreaSno INT,@CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return
    SELECT  Ar.*, Ar.Area_Name as Name, 'Code: '+ Ar.Area_Code as Details
    FROM      Area Ar
    WHERE     (AreaSno=@AreaSno OR @AreaSno = 0) AND (CompSno =@CompSno)

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Area_Delete') BEGIN DROP PROCEDURE Sp_Area_Delete END
GO

CREATE PROCEDURE Sp_Area_Delete
    @AreaSno INT
WITH ENCRYPTION AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
            DELETE FROM Area WHERE AreaSno=@AreaSno
            IF @@ERROR <> 0 GOTO CloseNow
    COMMIT TRANSACTION
    RETURN 1
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO




IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Items' ) BEGIN DROP PROCEDURE Sp_Items END
GO


CREATE PROCEDURE Sp_Items
    @ItemSno INT,
    @Item_Code VARCHAR(20),
    @Item_Name VARCHAR(50),
    @GrpSno INT,
    @Require_LabTest BIT,
    @Remarks VARCHAR(100),
    @Active_Status BIT,
    @Create_Date INT,
    @Taxable BIT,
    @UserSno INT,
    @CompSno INT,
    @RetSno INT OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        IF EXISTS(SELECT ItemSno FROM Items WHERE ItemSno=@ItemSno)
            BEGIN
                DECLARE @IsStd BIT = (SELECT IsStd FROM Items WHERE ItemSno=@ItemSno)
                IF @IsStd = 0
                  BEGIN
                    UPDATE Items SET Item_Code=@Item_Code,Item_Name=@Item_Name,GrpSno=@GrpSno,Require_LabTest=@Require_LabTest,Remarks=@Remarks,Active_Status=@Active_Status,Create_Date=@Create_Date,Taxable=@Taxable,UserSno=@UserSno,CompSno=@CompSno
                    WHERE ItemSno=@ItemSno
                    IF @@ERROR <> 0 GOTO CloseNow
                  END
                ELSE
                  BEGIN
                    UPDATE Items SET Item_Name=@Item_Name,Require_LabTest=@Require_LabTest,Remarks=@Remarks,Active_Status=@Active_Status,Create_Date=@Create_Date,Taxable=@Taxable,UserSno=@UserSno,CompSno=@CompSno
                    WHERE ItemSno=@ItemSno
                    IF @@ERROR <> 0 GOTO CloseNow
                  END
            End
        Else
            BEGIN

            DECLARE @ItemCode_AutoGen BIT
            SELECT @ItemCode_AutoGen=ItemCode_AutoGen FROM Transaction_Setup WHERE CompSno=@CompSno
            IF @ItemCode_AutoGen=1
            BEGIN
                SELECT @Item_Code=TRIM(ItemCode_Prefix)+CAST((ItemCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE CompSno=@CompSno
            End

            IF EXISTS(SELECT ItemSno FROM Items WHERE  Item_Code=@Item_Code AND CompSno =@CompSno)
              BEGIN
                  Raiserror ('Items exists with this Code', 16, 1)
                  GoTo CloseNow
              End

             INSERT INTO Items(Item_Code,Item_Name,GrpSno,Require_LabTest,Remarks,Active_Status,Create_Date,Taxable,UserSno,CompSno,IsStd)
             VALUES (@Item_Code,@Item_Name,@GrpSno,@Require_LabTest,@Remarks,@Active_Status,@Create_Date,@Taxable,@UserSno,@CompSno,0)
             IF @@ERROR <> 0 GOTO CloseNow
             SET @ItemSno = @@IDENTITY

             IF @ItemCode_AutoGen=1
              BEGIN
                UPDATE Transaction_Setup SET ItemCode_CurrentNo = ItemCode_CurrentNo + 1 WHERE CompSno=@CompSno
                IF @@ERROR <> 0 GOTO CloseNow
              END
            End

    SET @RetSno = @ItemSno
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getItems') BEGIN DROP FUNCTION Udf_getItems END
GO

CREATE FUNCTION Udf_getItems(@ItemSno INT,@GrpSno INT, @CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return
 SELECT   (SELECT  It.*, It.Item_Name as Name, 'Code: '+ It.Item_Code as Details, Ig.Grp_Name as Grp_Name,
                  Ig.GrpSno   as 'IGroup.GrpSno',
                  Ig.Grp_Code as 'IGroup.Grp_Code',
                  Ig.Grp_Name as 'IGroup.Grp_Name',
                  Ig.Grp_Name as 'IGroup.Name'
                    
          FROM      Items It
                    INNER JOIN Item_Groups Ig ON Ig.GrpSno = It.GrpSno
          WHERE     (ItemSno=@ItemSno OR @ItemSno = 0) AND (It.GrpSno =@GrpSno OR @GrpSno=0) AND (It.CompSno =@CompSno)

          FOR JSON PATH) as Json_Result

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Items_Delete') BEGIN DROP PROCEDURE Sp_Items_Delete END
GO

CREATE PROCEDURE Sp_Items_Delete
    @ItemSno INT
WITH ENCRYPTION AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        IF (SELECT IsStd FROM Items WHERE ItemSno=@ItemSno) =1
          BEGIN
            Raiserror ('Standard Items cannot be deleted', 16, 1)
            GoTo CloseNow
          END
        DELETE FROM Items WHERE ItemSno=@ItemSno
        IF @@ERROR <> 0 GOTO CloseNow
    COMMIT TRANSACTION
    RETURN 1
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Uom' ) BEGIN DROP PROCEDURE Sp_Uom END
GO

CREATE PROCEDURE Sp_Uom
    @UomSno INT,
    @Uom_Code VARCHAR(10),
    @Uom_Name VARCHAR(20),
    @BaseUomSno INT,
    @Base_Qty DECIMAL(7,2),
    @Active_Status BIT,
    @Remarks VARCHAR(100),
    @Create_Date INT,
    @UserSno INT,
    @CompSno INT,
    @RetSno INT OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        IF EXISTS(SELECT UomSno FROM Uom WHERE UomSno=@UomSno)
            BEGIN
                DECLARE @IsStd BIT = (SELECT IsStd FROM Uom WHERE UomSno=@UomSno)
                IF @IsStd = 0
                  BEGIN
                    UPDATE Uom SET Uom_Code=@Uom_Code,Uom_Name=@Uom_Name,BaseUomSno=@BaseUomSno,Base_Qty=@Base_Qty,Active_Status=@Active_Status,Remarks=@Remarks,Create_Date=@Create_Date,UserSno=@UserSno,CompSno=@CompSno
                    WHERE UomSno=@UomSno
                    IF @@ERROR <> 0 GOTO CloseNow
                  END
                ELSE
                  BEGIN
                    UPDATE Uom SET Uom_Name=@Uom_Name,BaseUomSno=@BaseUomSno,Base_Qty=@Base_Qty,Active_Status=@Active_Status,Remarks=@Remarks,Create_Date=@Create_Date,UserSno=@UserSno,CompSno=@CompSno
                    WHERE UomSno=@UomSno
                    IF @@ERROR <> 0 GOTO CloseNow
                  END
            End
        Else
            BEGIN

            DECLARE @UomCode_AutoGen BIT
            SELECT @UomCode_AutoGen=UomCode_AutoGen FROM Transaction_Setup WHERE CompSno=@CompSno
            IF @UomCode_AutoGen=1
            BEGIN
                SELECT @Uom_Code=TRIM(UomCode_Prefix)+CAST((UomCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE CompSno=@CompSno
            End

            IF EXISTS(SELECT UomSno FROM Uom WHERE  Uom_Code=@Uom_Code AND CompSno =@CompSno)
              BEGIN
                  Raiserror ('Uom exists with this Code', 16, 1)
                  GoTo CloseNow
              End

             INSERT INTO Uom(Uom_Code,Uom_Name,BaseUomSno,Base_Qty,Active_Status,Remarks,Create_Date,UserSno,CompSno, IsStd)
             VALUES (@Uom_Code,@Uom_Name,@BaseUomSno,@Base_Qty,@Active_Status,@Remarks,@Create_Date,@UserSno,@CompSno,0)
             IF @@ERROR <> 0 GOTO CloseNow
             SET @UomSno = @@IDENTITY

              IF @UomCode_AutoGen=1
              BEGIN
                UPDATE Transaction_Setup SET UomCode_CurrentNo = UomCode_CurrentNo + 1 WHERE CompSno=@CompSno
                IF @@ERROR <> 0 GOTO CloseNow
              END

            End

    SET @RetSno = @UomSno
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getUom') BEGIN DROP FUNCTION Udf_getUom END
GO

CREATE FUNCTION Udf_getUom(@UomSno INT,@CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return
   	SELECT    ( SELECT	Um.*, Um.Uom_Name as 'Name', Um.Uom_Name as 'Details', Bu.UomSno as 'BaseUom.UomSno', Bu.Uom_Name as 'BaseUom.Uom_Name',  Bu.Uom_Name as 'BaseUom.Name',
              Bu.Uom_Name as BaseUom_Name
	            FROM	  Uom Um
                      LEFT OUTER JOIN   Uom Bu ON Bu.UomSno=Um.BaseUomSno
	            WHERE	  (Um.UomSno=@UomSno OR @UomSno = 0) AND (Um.CompSno=@CompSno)
              FOR JSON PATH ) AS Json_Result

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Uom_Delete') BEGIN DROP PROCEDURE Sp_Uom_Delete END
GO

CREATE PROCEDURE Sp_Uom_Delete
    @UomSno INT
WITH ENCRYPTION AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
      IF (SELECT IsStd FROM Uom WHERE UomSno=@UomSno) =1
          BEGIN
            Raiserror ('Standard Uoms cannot be deleted', 16, 1)
            GoTo CloseNow
          END
      DELETE FROM Uom WHERE UomSno=@UomSno
      IF @@ERROR <> 0 GOTO CloseNow
    COMMIT TRANSACTION
    RETURN 1
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Client' ) BEGIN DROP PROCEDURE Sp_Client END
GO

CREATE PROCEDURE Sp_Client
    @ClientSno INT,
    @Client_Code VARCHAR(10),
    @Client_Name VARCHAR(50),
    @Address VARCHAR(200),
    @City VARCHAR(50),
    @Pincode VARCHAR(20),
    @State VARCHAR(50),
    @Mobile VARCHAR(50),
    @Client_Type TINYINT,
    @Client_Cat TINYINT,
    @Sex TINYINT,
    @Dob INT,
    @Create_Date INT,
    @Issue_Date INT,
    @Expiry_Date INT,
    @Email VARCHAR(50),
    @Id_Number VARCHAR(50),
    @Gst_Number VARCHAR(50),
    @Director_Name VARCHAR(50),
    @Remarks VARCHAR(100),
    @Commision DECIMAL(5,2),
    @AreaSno INT,
    @Blocked BIT,
    @UserSno INT,
    @CompSno INT,
    @ImageDetailXML    XML,
    @RetSno INT OUTPUT,
    @Ret_Client_Code   VARCHAR(20) OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
      DECLARE @LedSno INT = 0
      IF (@CompSno=0) 
      BEGIN
          Raiserror ('Company is not Identified...Relogin the App' , 16, 1) 
          GOTO CloseNow
      END

      IF (@UserSno=0) 
      BEGIN
          Raiserror ('User cannot be emty' , 16, 1) 
          GOTO CloseNow
      END

      IF (@ClientSno=0) AND (LEN(TRIM(@Mobile)) <> 0) AND (EXISTS(SELECT ClientSno FROM Client WHERE Mobile=@Mobile AND CompSno=@CompSno))
      BEGIN
          Raiserror ('Client exists with this Mobile Number' , 16, 1) 
          GOTO CloseNow
      END

        IF EXISTS(SELECT ClientSno FROM Client WHERE ClientSno=@ClientSno)
            BEGIN
                UPDATE Client SET Client_Code=@Client_Code,Client_Name=@Client_Name,Address=@Address,City=@City,Pincode=@Pincode,State=@State,Mobile=@Mobile,Client_Type=@Client_Type,Client_Cat=@Client_Cat,Sex=@Sex,Dob=@Dob,Create_Date=@Create_Date,Issue_Date=@Issue_Date,Expiry_Date=@Expiry_Date,Email=@Email,Id_Number=@Id_Number,Gst_Number=@Gst_Number,Director_Name=@Director_Name,Remarks=@Remarks,Commision=@Commision,AreaSno=@AreaSno,Blocked=@Blocked,UserSno=@UserSno,CompSno=@CompSno
                WHERE ClientSno=@ClientSno
                IF @@ERROR <> 0 GOTO CloseNow
                SELECT @LedSno=LedSno FROM Client WHERE ClientSno=@ClientSno
                DELETE FROM Image_Details WHERE TransSno=@ClientSno AND Image_Grp=1
                IF @@ERROR <> 0 GOTO CloseNow
            End
        Else
            BEGIN

            DECLARE @ClientCode_AutoGen BIT
            SELECT @ClientCode_AutoGen=ClientCode_AutoGen FROM Transaction_Setup WHERE CompSno=@CompSno
            IF @ClientCode_AutoGen=1
            BEGIN
                SELECT @Client_Code=TRIM(ClientCode_Prefix)+CAST((ClientCode_CurrentNo+1) AS VARCHAR) FROM Transaction_Setup WHERE CompSno=@CompSno
            End

            IF EXISTS(SELECT ClientSno FROM Client WHERE  Client_Code=@Client_Code AND CompSno =@CompSno)
              BEGIN
                  Raiserror ('Client exists with this Code', 16, 1)
                  GoTo CloseNow
              End

             INSERT INTO Client(Client_Code,Client_Name,Address,City,Pincode,State,Mobile,Client_Type,Client_Cat,Sex,Dob,Create_Date,Issue_Date,Expiry_Date,Email,Id_Number,Gst_Number,Director_Name,Remarks,Commision,AreaSno,Blocked,UserSno,CompSno)
             VALUES (@Client_Code,@Client_Name,@Address,@City,@Pincode,@State,@Mobile,@Client_Type,@Client_Cat,@Sex,@Dob,@Create_Date,@Issue_Date,@Expiry_Date,@Email,@Id_Number,@Gst_Number,@Director_Name,@Remarks,@Commision,@AreaSno,@Blocked,@UserSno,@CompSno)
             IF @@ERROR <> 0 GOTO CloseNow
             SET @ClientSno = @@IDENTITY

             IF @ClientCode_AutoGen=1
              BEGIN
                UPDATE Transaction_Setup SET ClientCode_CurrentNo = ClientCode_CurrentNo + 1 WHERE CompSno=@CompSno
                IF @@ERROR <> 0 GOTO CloseNow
              END

            End
            
            EXEC SSp_AccLedger_Master @LedSno, '', @Client_Name, 21,  0, 0, 0, @Create_Date, @CompSno, @UserSno, @LedSno OUTPUT
            UPDATE Client SET LedSno=@LedSno WHERE ClientSno=@ClientSno
            IF @@ERROR <> 0 GOTO CloseNow

            IF @ImageDetailXML IS NOT NULL
              BEGIN                     
                  DECLARE @Sno         INT
                  DECLARE @idoc1       INT
                  DECLARE @doc1        XML
                  DECLARE @Image_Name  VARCHAR(50)
                  DECLARE @Image_Url   VARCHAR(100)
                                              
                  /*Declaring Temporary Table for Details Table*/
                  DECLARE @ImgTable Table
                  (
                      Sno INT IDENTITY(1,1),Image_Name VARCHAR(50), Image_Url VARCHAR(200)
                  )
                  Set @doc1=@ImageDetailXML
                  Exec sp_xml_preparedocument @idoc1 Output, @doc1
             
                  /*Inserting into Temporary Table from Passed XML File*/
                  INSERT INTO @ImgTable
                  (
                      Image_Name, Image_Url
                  )
             
                  SELECT  * FROM  OpenXml 
                  (
                      @idoc1, '/ROOT/Images/Image_Details',2
                  )
                  WITH 
                  (
                      Image_Name VARCHAR(50) '@Image_Name', Image_Url VARCHAR(100) '@Image_Url'
                  )
                  SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
                  FROM @ImgTable
                  
                  /*Taking from Temporary Details Table and inserting into details table here*/
                  WHILE @@ROWCOUNT <> 0 
                      BEGIN
                          INSERT INTO [dbo].Image_Details(TransSno,Image_Grp,Image_Name, Image_Url,CompSno) 
                          VALUES (@ClientSno,1, @Image_Name, (@Image_Url + '/' + @Client_Code+'/'+ @Image_Name),@CompSno)
                          IF @@Error <> 0 GOTO CloseNow
             
                          DELETE FROM @ImgTable WHERE Sno = @Sno
                          SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
                          FROM   @ImgTable
                      END
                  Exec Sp_Xml_Removedocument @idoc1
            END

	    

    SET @RetSno = @ClientSno
    SET @Ret_Client_Code = @Client_Code
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getClient') BEGIN DROP FUNCTION Udf_getClient END
GO

CREATE FUNCTION Udf_getClient(@ClientSno INT,@CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return
    SELECT    Clnt.*, Clnt.Client_Name as Name, 'Code: '+ Clnt.Client_Code as Details,
              ISNULL(Ar.Area_Name,'') as Area_Name,
              Profile_Image= CASE WHEN EXISTS(SELECT DetSno FROM Image_Details WHERE TransSno=Clnt.ClientSno AND Image_Grp=1 AND CompSno=@CompSno) THEN 'https://www.xauag.au/data/'+(SELECT TOP 1 Image_Url FROM Image_Details WHERE TransSno=Clnt.ClientSno AND Image_Grp=1 AND CompSno=@CompSno) ELSE '' END,
                          
              ISNULL((SELECT Img.Image_Name,'' as Image_File, Image_Url='https://www.xauag.au/data/'+Img.Image_Url, '1' as SrcType, 0 as DelStatus FROM Image_Details Img WHERE TransSno = Clnt.ClientSno AND Image_Grp=1 FOR JSON PATH),'') Images_Json
                  
                  
    FROM      Client Clnt
              LEFT OUTER JOIN Area Ar On Ar.AreaSno = Clnt.AreaSno
    WHERE     (ClientSno=@ClientSno OR @ClientSno = 0) AND (Clnt.CompSno =@CompSno)

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Client_Delete') BEGIN DROP PROCEDURE Sp_Client_Delete END
GO

CREATE PROCEDURE Sp_Client_Delete
    @ClientSno INT
WITH ENCRYPTION AS
BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
          DELETE FROM Image_Details WHERE TransSno=@ClientSno AND Image_Grp=1
          IF @@ERROR <> 0 GOTO CloseNow

            DELETE FROM Client WHERE ClientSno=@ClientSno
            IF @@ERROR <> 0 GOTO CloseNow
    COMMIT TRANSACTION
    RETURN 1
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Ledger_Groups' ) BEGIN DROP PROCEDURE Sp_Ledger_Groups END
GO

CREATE PROCEDURE Sp_Ledger_Groups
    @GrpSno INT,
    @Grp_Code VARCHAR(20),
    @Grp_Name VARCHAR(50),
    @Grp_Under INT,
    @Grp_Level TINYINT,
    @Grp_Desc VARCHAR(200),
    @Grp_Nature TINYINT,
    @Affect_Gp BIT,
    @Remarks VARCHAR(100),
    @IsStd BIT,
    @Created_Date INT,
    @RetSno INT OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION
        IF EXISTS(SELECT GrpSno FROM Ledger_Groups WHERE GrpSno=@GrpSno)
            BEGIN
                UPDATE Ledger_Groups SET Grp_Code=@Grp_Code,Grp_Name=@Grp_Name,Grp_Under=@Grp_Under,Grp_Level=@Grp_Level,Grp_Desc=@Grp_Desc,Grp_Nature=@Grp_Nature,Affect_Gp=@Affect_Gp,Remarks=@Remarks,IsStd=@IsStd,Created_Date=@Created_Date
                WHERE GrpSno=@GrpSno
                IF @@ERROR <> 0 GOTO CloseNow
            End
        Else
            BEGIN
        IF EXISTS(SELECT GrpSno FROM Ledger_Groups WHERE  Grp_Code=@Grp_Code )
          BEGIN
              Raiserror ('Ledger_Groups exists with this Code', 16, 1)
              GoTo CloseNow
          End

         INSERT INTO Ledger_Groups(Grp_Code,Grp_Name,Grp_Under,Grp_Level,Grp_Desc,Grp_Nature,Affect_Gp,Remarks,IsStd,Created_Date)
         VALUES (@Grp_Code,@Grp_Name,@Grp_Under,@Grp_Level,@Grp_Desc,@Grp_Nature,@Affect_Gp,@Remarks,@IsStd,@Created_Date)
         IF @@ERROR <> 0 GOTO CloseNow
         SET @GrpSno = @@IDENTITY

            End

    SET @RetSno = @GrpSno
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLedger_Groups') BEGIN DROP FUNCTION Udf_getLedger_Groups END
GO

CREATE FUNCTION Udf_getLedger_Groups(@GrpSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return
    SELECT (  SELECT    Grp.*, Grp.Grp_Name as Name, 'Code: '+ Grp.Grp_Code as Details,
                        Grp.GrpSno as 'GroupUnder.GrpSno', Gu.Grp_Code as 'GroupUnder.Grp_Code', Gu.Grp_Name as 'GroupUnder.Grp_Name', Gu.Grp_Name as 'GroupUnder.Name', Gu.Grp_Name as 'GroupUnder.Details',
                        Gu.Grp_Name as GrpUnder_Name
              FROM      Ledger_Groups Grp
                        INNER JOIN Ledger_Groups Gu ON Gu.GrpSno=Grp.Grp_Under
              WHERE     (Grp.GrpSno=@GrpSno OR @GrpSno = 0)
              FOR JSON PATH
          ) AS Json_Result

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Ledger_Group_Delete') BEGIN DROP PROCEDURE Sp_Ledger_Group_Delete END
GO
CREATE PROCEDURE Sp_Ledger_Group_Delete
	@GrpSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
      DECLARE @IsStd BIT = (SELECT IsStd FROM Ledger_Groups WHERE GrpSno=@GrpSno)
      IF @IsStd = 1
        BEGIN
          Raiserror ('Standard Groups cannot be deleted', 16, 1) 
					GOTO CloseNow
        END

			IF EXISTS (SELECT LedSno FROM Ledgers WHERE GrpSno=@GrpSno)
				BEGIN
					Raiserror ('Ledgers exists with this Group. Cannot Delete', 16, 1) 
					GOTO CloseNow
				END

			DELETE FROM Ledger_Groups WHERE GrpSno=@GrpSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SSp_AccLedger_Master') BEGIN DROP PROCEDURE SSp_AccLedger_Master END
GO

CREATE PROCEDURE SSp_AccLedger_Master 
        -- Add the parameters for the stored PROCEDURE here
         @LedSno            INT,
         @Led_Code          VARCHAR(20),
         @Led_Name          VARCHAR(50),         
         @GrpSno            INT,
         @OpenSno           INT,
         @Opening_Balance   MONEY,
         @AcType            BIT,         
         @Created_Date      INT,
         @CompSno           INT,
         @UserSno           INT,
         @RetSno	        INT OUTPUT

    WITH ENCRYPTION AS 
        BEGIN
         SET NOCOUNT ON
         DECLARE @isExists   INT
         DECLARE @Grp_Desc    VARCHAR(50)
         DECLARE @Led_Desc    VARCHAR(50)        
         BEGIN TRANSACTION
         

         SELECT @Grp_Desc=Grp_Desc FROM Ledger_Groups WHERE GrpSno=@GrpSno
         SET @Led_Desc=@Grp_Desc+'L'+[dbo].PreFillString(0,3)+'L'
         SET @Led_Code = LEFT(@Led_Name,20)

         IF EXISTS(SELECT LedSno FROM Ledgers WHERE LedSno=@LedSno)
             BEGIN
                  DECLARE @IsStd BIT = (SELECT IsStd FROM Ledgers WHERE LedSno=@LedSno)
                  IF @IsStd <> 1
                  BEGIN
                     UPDATE Ledgers SET Led_Code=@Led_Code,Led_Name=@Led_Name,GrpSno=@GrpSno,Created_Date=@Created_Date, CompSno=@CompSno, UserSno=@UserSno
                     WHERE LedSno=@LedSno
                     IF @@ERROR <> 0 GOTO CloseNow
                  END
                 DELETE FROM Vouchers WHERE VouSno=@OpenSno
                 IF @@ERROR <> 0 GOTO CloseNow
                 DELETE FROM Voucher_Details WHERE VouSno=@OpenSno
                 IF @@ERROR <> 0 GOTO CloseNow
             END
         ELSE
             BEGIN                
                 INSERT INTO Ledgers (Led_Code,Led_Name,GrpSno, OpenSno, Led_Desc, IsStd, Created_Date,CompSno,UserSno,Std_No) 
                 VALUES (@Led_Code,@Led_Name,@GrpSno,0,@Led_Desc,0,@Created_Date,@CompSno,@UserSno,0)
                 IF @@ERROR <> 0 GOTO CloseNow
                 SET @LedSno=@@IDENTITY
             END

            IF @Opening_Balance <> 0
              BEGIN
                DECLARE @SeriesSno INT = (SELECT SeriesSno FROM Voucher_Series WHERE CompSno=@CompSno AND VouTypeSno = 1)
                INSERT INTO Vouchers(VouTypeSno, SeriesSno, Vou_No, Vou_Date, Narration, TrackSno, IsAuto, GenType, UserSno, CompSno)
                VALUES (1, @SeriesSno, '', 0, 'Ledger Opening Balance', 0, 1, 0, @UserSno, @CompSno)
                IF @@ERROR <> 0 GOTO CloseNow
                SET @OpenSno=@@IDENTITY

                IF @AcType = 0
                  BEGIN
                    INSERT INTO Voucher_Details(VouSno,LedSno,Debit,Credit) VALUES  (@OpenSno, @LedSno, @Opening_Balance, 0)
                    IF @@ERROR <> 0 GOTO CloseNow
                  END
                ELSE
                  BEGIN
                    INSERT INTO Voucher_Details(VouSno,LedSno,Debit,Credit) VALUES  (@OpenSno, @LedSno, 0, @Opening_Balance)
                    IF @@ERROR <> 0 GOTO CloseNow
                  END                 

                UPDATE Ledgers SET OpenSno=@OpenSno WHERE LedSno=@LedSno
                IF @@ERROR <> 0 GOTO CloseNow

              END

        COMMIT TRANSACTION
        SET @RetSno = @LedSno
        RETURN @LedSno
        CloseNow:
         ROLLBACK TRANSACTION
         RETURN 0
        END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getLedgers') BEGIN DROP FUNCTION Udf_getLedgers END
GO
CREATE FUNCTION Udf_getLedgers(@LedSno INT, @GrpSno INT, @CompSno INT, @ExcludeGrpSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

  SELECT  (
          SELECT      Led.*, Led.Led_Name as 'Name', Grp.Grp_Name as 'Details',
                      Grp.Grp_Name,
                      Opening_Balance = ISNULL(CASE
                                          WHEN (SELECT SUM(Debit) FROM Voucher_Details WHERE VouSno = Led.OpenSno) <> 0
                                            THEN  (SELECT SUM(Debit) FROM Voucher_Details WHERE VouSno = Led.OpenSno)
                                          ELSE (SELECT SUM(Credit) FROM Voucher_Details WHERE VouSno = Led.OpenSno)
                                          END,0),
                      AcType = CASE
                                    WHEN (SELECT SUM(Debit) FROM Voucher_Details WHERE VouSno = Led.OpenSno) <> 0
                                      THEN  0
                                    ELSE 1
                                    END,
                      Grp.GrpSno as 'Group.GrpSno', Grp.Grp_Code as 'Group.Grp_Code', Grp.Grp_Name as 'Group.Grp_Name', Grp.Grp_Name as 'Group.Name', Grp.Grp_Name as 'Group.Details' 
          FROM        Ledgers Led
                      INNER JOIN Ledger_Groups Grp ON Grp.GrpSno = Led.GrpSno                            
          WHERE       (Led.LedSno=@LedSno OR @LedSno=0) AND (Led.GrpSno=@GrpSno OR @GrpSno = 0) AND (Led.CompSno=@CompSno) AND (Led.LedSno <> @ExcludeGrpSno)

          FOR JSON PATH
          ) as Json_Result
        
 GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Ledger_Delete') BEGIN DROP PROCEDURE Sp_Ledger_Delete END
GO
CREATE PROCEDURE Sp_Ledger_Delete
	@LedSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION
      DECLARE @IsStd BIT = (SELECT IsStd FROM Ledgers WHERE LedSno=@LedSno)
      DECLARE @OpenSno INT = (SELECT OpenSno FROM Ledgers WHERE LedSno=@LedSno)
      IF @IsStd = 1
        BEGIN
          Raiserror ('Standard Ledgers cannot be deleted', 16, 1) 
					GOTO CloseNow
        END
        
			IF EXISTS (SELECT LedSno FROM Voucher_Details WHERE LedSno=@LedSno AND VouSno <> @OpenSno)
				BEGIN
					Raiserror ('Vouchers exists with this Ledger. Cannot Delete', 16, 1) 
					GOTO CloseNow
				END
      DELETE FROM Voucher_Details WHERE VouSno=@OpenSno
      IF @@ERROR <> 0 GOTO CloseNow
      DELETE FROM Vouchers WHERE VouSno=@OpenSno
      IF @@ERROR <> 0 GOTO CloseNow
			DELETE FROM Ledgers WHERE LedSno=@LedSno
			IF @@ERROR <> 0 GOTO CloseNow
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_AccVouchers') BEGIN DROP PROCEDURE Sp_AccVouchers END
GO

CREATE PROCEDURE Sp_AccVouchers        
  @VouSno             INT,
  @VouTypeSno         INT,
  @SeriesSno          INT,    
  @Vou_No             VARCHAR(20),
  @Vou_Date           INT,                  
  @Narration          VARCHAR(200),
  @TrackSno           INT,
  @IsAuto             BIT,
  @GenType            TINYINT,
  @UserSno            INT,
  @CompSno			      INT,
  @VouDetailXML      XML,
  @RetSno			        INT OUTPUT
        
WITH ENCRYPTION AS 
BEGIN
  SET NOCOUNT ON		 
  DECLARE @NumType    TINYINT
  BEGIN TRANSACTION
         
	IF EXISTS(SELECT VouSno FROM Vouchers WHERE VouSno=@VouSno)
          BEGIN
              UPDATE Vouchers SET VouTypeSno=@VouTypeSno,SeriesSno=@SeriesSno,Vou_No=@Vou_No,Vou_Date=@Vou_Date,Narration=@Narration,TrackSno=@TrackSno,IsAuto=@IsAuto,GenType=@GenType,UserSno=@UserSno, CompSno=@CompSno
              WHERE VouSno=@VouSno
              If @@Error <> 0 Goto CloseNow
              /* Deleting All sub TABLE Rows*/
              DELETE FROM Voucher_Details WHERE VouSno=@VouSno
              If @@Error <> 0 Goto CloseNow
          END
      ELSE        
          BEGIN    
            /*  IF @VouTypeSno < 10           
                BEGIN
                    DECLARE @Num_Method TINYINT
                    SELECT @Num_Method=Num_Method FROM Voucher_Series WHERE SeriesSno=@SeriesSno

                    IF (@Num_Method=2)
                    BEGIN
                        SET @Vou_No= [dbo].GenerateVoucherNo(@SeriesSno)           
                    END                  
                END
              */
              
              INSERT INTO Vouchers (VouTypeSno,SeriesSno,Vou_No,Vou_Date,Narration,TrackSno,IsAuto,GenType,UserSno,CompSno)
              VALUES (@VouTypeSno,@SeriesSno,@Vou_No,@Vou_Date,@Narration,@TrackSno,@IsAuto,@GenType,@UserSno,@CompSno)
              IF @@Error <> 0 GOTO CloseNow
              SET @VouSno=@@Identity

              /*IF (@Num_Method <> 0)
                BEGIN
                    UPDATE Voucher_Series SET Current_No = Current_No + 1 WHERE SeriesSno=@SeriesSno
                    IF @@ERROR <> 0 GOTO CloseNow
                END
                */
          END

         DECLARE @idoc       INT
         DECLARE @Sno        INT 
         DECLARE @LedSno     INT
         DECLARE @Debit      MONEY
         DECLARE @Credit     MONEY
        
         DECLARE @DetTable TABLE
             (
             Sno INT IDENTITY(1,1),LedSno INT,Debit MONEY,Credit MONEY
             )
         Exec sp_xml_preparedocument @idoc OUTPUT, @VouDetailXML
        
         INSERT INTO @DetTable
             (
             LedSno,Debit,Credit
             )
         SELECT  * FROM  OpenXml 
             (
              @idoc, '/ROOT/Voucher/Voucher_Details',2
             )
         WITH 
            (
              LedSno INT '@LedSno',Debit MONEY '@Debit',Credit MONEY '@Credit'
            )
         SELECT      TOP 1 @Sno=Sno,@LedSno=LedSno,@Debit=Debit,@Credit=Credit
                     FROM @DetTable
        /*Taking FROM Temporary Details TABLE AND inserting INTO details TABLE here*/
         WHILE @@ROWCOUNT <> 0 
             BEGIN
                 INSERT INTO Voucher_Details(VouSno,LedSno,Debit,Credit) 
                 VALUES (@VouSno,@LedSno,@Debit,@Credit)
                 IF @@Error <> 0 GOTO CloseNow
                 DELETE FROM @DetTable WHERE Sno = @Sno
                 
				 SELECT      TOP 1 @Sno=Sno,@LedSno=LedSno,@Debit=Debit,@Credit=Credit
                 FROM        @DetTable
             END
         Exec Sp_Xml_Removedocument @idoc
        COMMIT TRANSACTION
        SET @RetSno = @VouSno
        RETURN @VouSno

  CloseNow:
         ROLLBACK TRANSACTION
         RETURN 0
        END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_VOUCHERS') BEGIN DROP VIEW VW_VOUCHERS END
GO

CREATE VIEW VW_VOUCHERS
WITH ENCRYPTION AS
  SELECT    Vou.*, VTyp.VouType_Name, Ser.Series_Name,
            Voucher_Amount = (SELECT SUM(Debit) FROM Voucher_Details WHERE VouSno=Vou.VouSno),
            Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Vou.VouSno AND Document_Type = 2 AND Updation_Type = 2) THEN 2 ELSE 1 END

  FROM      Vouchers Vou
            INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Vou.VouTypeSno
            INNER JOIN Voucher_Series Ser ON Ser.SeriesSno = Vou.SeriesSno            
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getVouchers') BEGIN DROP FUNCTION Udf_getVouchers END
GO
CREATE FUNCTION Udf_getVouchers(@VouSno INT, @VouTypeSno INT, @SeriesSno INT, @CompSno INT, @Cancel_Status TINYINT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN
  SELECT    Vou.*,
            --Det.DetSno, Det.LedSno, Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Led_Name', Led.Led_Name as 'Ledger.Name',Led.Led_Name as 'Ledger.Details',
            ( SELECT  Det.*, Type = CASE WHEN Debit > 0 THEN 0 ELSE 1 END, Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Led_Name', Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details'
              FROM    Voucher_Details Det
                      INNER JOIN Ledgers Led ON Led.LedSno = Det.LedSno
              WHERE   VouSno = Vou.VouSno FOR JSON PATH) VouDetails_Json
  FROM      VW_VOUCHERS Vou
            
  WHERE     (Vou.VouSno=@VouSno OR @VouSno = 0) AND
            (Vou.VouTypeSno=@VouTypeSno OR @VouTypeSno = 0) AND
            (Vou.SeriesSno=@SeriesSno OR @SeriesSno = 0) AND
            (Vou.Cancel_Status = @Cancel_Status OR @Cancel_Status=0) AND
            (Vou.CompSno=@CompSno)

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Voucher_Delete') BEGIN DROP PROCEDURE Sp_Voucher_Delete END
GO
CREATE PROCEDURE Sp_Voucher_Delete
	@VouSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION      
      DELETE FROM Voucher_Details WHERE VouSno=@VouSno
      IF @@ERROR <> 0 GOTO CloseNow
      DELETE FROM Vouchers WHERE VouSno=@VouSno
      IF @@ERROR <> 0 GOTO CloseNow			
	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_VOUCHERMASTER') BEGIN DROP VIEW VW_VOUCHERMASTER END
GO

CREATE VIEW VW_VOUCHERMASTER
        WITH ENCRYPTION
        AS
            SELECT      Vm.VouSno, Vm.VouTypeSno, Vt.VouType_Name, Vm.SeriesSno,Vs.Series_Name,
                        Vm.Vou_No, Vm.Vou_Date,
                        Vm.TrackSno, Vm.Narration, 
                        Vs.BranchSno, Vm.CompSno
            FROM        Vouchers Vm
                        INNER JOIN  Voucher_Types Vt ON Vm.VouTypeSno = Vt.VouTypeSno
                        INNER JOIN  Voucher_Series Vs ON Vs.SeriesSno = Vm.SeriesSno
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_VOUCHERDETAILS') BEGIN DROP VIEW VW_VOUCHERDETAILS END
GO
CREATE VIEW VW_VOUCHERDETAILS
        WITH ENCRYPTION
        AS
          SELECT    Vd.DetSno, Vd.VouSno, Vm.Vou_Date,Vm.TrackSno, Vm.VouTypeSno, Vt.VouType_Name,
                    Vm.Vou_No, Vd.LedSno, Lm.GrpSno, Lg.Grp_Name, Lm.Led_Name,
                    Vd.Credit, Vd.Debit, Lg.Grp_Nature, Lm.Led_Desc, Vs.BranchSno,
                    Vm.Narration, Vm.CompSno
          FROM      Voucher_Details Vd
                    INNER JOIN Ledgers Lm  ON Vd.LedSno = Lm.LedSno
                    INNER JOIN Vouchers Vm       ON Vd.VouSno = Vm.VouSno
                    INNER JOIN  Voucher_Types Vt  ON Vm.VouTypeSno = Vt.VouTypeSno
                    INNER JOIN Ledger_Groups Lg  ON Lm.GrpSno = Lg.GrpSno
                    INNER JOIN  Voucher_Series Vs ON Vm.SeriesSno = Vs.SeriesSno
        
   GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_BILLWISEDETAILS') BEGIN DROP VIEW VW_BILLWISEDETAILS END
GO

CREATE VIEW VW_BILLWISEDETAILS
WITH ENCRYPTION
AS
SELECT          Vd.LedSno,Av.Vou_Date,Av.SeriesSno,Av.VouTypeSno,Vt.VouType_Name,
                Vd.VouSno,Vd.DetSno,Amount=Vd.Credit -Vd.Debit,
                Vd.Credit,Vd.Debit,Lm.Led_Name,Lm.GrpSno,
                Lg.Grp_Name,Lg.Grp_Level,Lg.Grp_Under,Lg.Grp_Nature ,Lg.Affect_Gp,
                Lg.Grp_Desc,Lm.Led_Desc + CAST(Lm.LedSno AS VARCHAR(10)) AS Led_Desc,
                Vs.BranchSno,Av.CompSno,
                Cancel_Status	= CASE WHEN EXISTS (SELECT StatusSno FROM Status_Updation WHERE TransSno=Av.VouSno AND Document_Type = 2 AND Updation_Type = 2) THEN 2 ELSE 1 END
FROM            Voucher_Details Vd
                INNER JOIN Vouchers Av ON Av.VouSno  = Vd.VouSno
                INNER JOIN Voucher_Types Vt ON Vt.VouTypeSno = Av.VouTypeSno
                INNER JOIN Ledgers Lm ON Lm.LedSno = Vd.LedSno
                INNER JOIN Ledger_Groups Lg ON Lg.GrpSno = Lm.GrpSno
                INNER JOIN Voucher_Series Vs ON Vs.SeriesSno = Av.SeriesSno
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_LEDGERS') BEGIN DROP VIEW VW_LEDGERS END
GO

CREATE VIEW VW_LEDGERS
  WITH ENCRYPTION
  AS
    SELECT         GrpSno AS Sno, Grp_Name AS [Name],
                    Grp_Level, 1 AS IsGrp, Grp_Desc AS hDesc,Grp_Nature,Affect_Gp,CompSno
    FROM           Companies_Ledger_Groups
    Union All
    SELECT        Lm.LedSno AS Sno, lm.Led_Name AS [Name],
                  Lg.Grp_Level + 1 AS [Grp_Level],0 AS IsGrp, Lm.Led_Desc+ Cast(LedSno AS VARCHAR(10)) AS hDesc,Lg.Grp_Nature,Lg.Affect_Gp, CompSno
    FROM          Ledgers Lm INNER JOIN
                  Ledger_Groups Lg On Lm.GrpSno = Lg.GrpSno
    Union All
    SELECT        0 AS Sno,'Opening Stock' AS [Name],
                  2 AS [Grp_Level], 0 AS IsGrp,'G001GG007GG000G' AS HDesc,2 AS GrpNature, 0 AS AffectGp, 0 as CompSno
 GO

 
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_LEDGERMASTER') BEGIN DROP VIEW VW_LEDGERMASTER END
GO

CREATE VIEW VW_LEDGERMASTER
WITH ENCRYPTION
AS
  SELECT    Lm.LedSno,Lm.Led_Name,Lm.Led_Desc,
            Lm.IsStd,Lg.GrpSno,
            Lg.Grp_Name,Lg.Grp_Level,Lg.Grp_Under,Lg.Grp_Nature,Lg.Affect_Gp ,
            Lg.Grp_Desc,Lm.CompSno
  FROM      Ledgers Lm
            INNER JOIN Ledger_Groups Lg On Lm.GrpSno = Lg.GrpSno
  WHERE     Lm.Std_No <> 1
 GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_VoucherDisplay') BEGIN DROP FUNCTION Udf_VoucherDisplay END
GO

CREATE FUNCTION Udf_VoucherDisplay(@FromDt INT, @ToDt AS INT,
@BranchSno AS INT, @VouTypeSno AS INT,
@Vou_No AS VARCHAR(20),@CompSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

  SELECT        *
  FROM          VW_VOUCHERDETAILS
  WHERE         (@VouTypeSno=0  OR VouTypeSno = @VouTypeSno)
                AND (CompSno=@CompSno)
                AND (@BranchSno=0   OR BranchSno = @BranchSno)
                AND (@Vou_No = ''   OR Vou_No = @Vou_No)                        
                AND (Vou_Date BETWEEN @FromDt AND @ToDt)

  GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='GetFinYrFromDt') BEGIN DROP FUNCTION GetFinYrFromDt END
GO

  CREATE FUNCTION GetFinYrFromDt(@cDate AS INT) 
        RETURNS INTEGER 
        WITH ENCRYPTION 
        AS 
          BEGIN
				DECLARE @Date DATE = [dbo].IntToDate(@cDate)
              DECLARE @Month  INTEGER
              DECLARE @Year   INTEGER
              DECLARE @Result INTEGER
              SELECT @Month   = MONTH(@Date) 
              SELECT @Year    = YEAR(@Date) 
              SELECT @Year    = CASE 
                          WHEN @Month < 4 THEN @Year - 1 
                          ELSE @Year 
                        END  
              SELECT @Result  = CAST(@Year AS VARCHAR) + CAST('0401' AS VARCHAR)              
              RETURN (CAST(@Result AS INT)) 
          END
GO

  IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetOutStandingSummary') BEGIN DROP FUNCTION Udf_GetOutStandingSummary END
  GO
  
  CREATE FUNCTION Udf_GetOutStandingSummary(@hDesc VARCHAR(100),@AsOn INT,@CompSno INT)
    RETURNS TABLE
    WITH ENCRYPTION
		RETURN		(	SELECT			GrpSno,LedSno,Led_Desc, Led_Name, SUM(Credit) AS Credit, SUM(Debit) AS Debit
						    FROM			  ( SELECT    GrpSno,LedSno,Led_Desc,Led_Name,
														            Credit = CASE When SUM(Amount)< 0 Then 0 ELSE Abs(SUM(Amount)) END,
														            Debit  = CASE When SUM(Amount)> 0 Then 0 ELSE Abs(SUM(Amount)) END
										          FROM		  VW_BILLWISEDETAILS
										          WHERE			CompSno=@CompSno AND (Led_Desc LIKE @hDesc AND Vou_Date <= @AsOn)
                          
										          GROUP BY		GrpSno, LedSno,Led_Desc, Led_Name ) t

          GROUP BY     GrpSno, LedSno,Led_Desc, Led_Name)
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetGrpBalance') BEGIN DROP FUNCTION Udf_GetGrpBalance END
  GO

  CREATE FUNCTION Udf_GetGrpBalance
			(@GrpSno AS INTEGER,
			@AsOn AS INTEGER,
			@YearFrom AS INTEGER,
			@BranchSno AS INTEGER,
			@CompSno INT)
        RETURNS MONEY
        WITH ENCRYPTION
        AS
          BEGIN
              DECLARE @Grp_Nature       TINYINT
              DECLARE @Grp_Desc         VARCHAR(100)
              DECLARE @PrvYear          INTEGER
              DECLARE @Bal              MONEY
              DECLARE @MyTable          TABLE(  Vou_Date    INT,
                                    LedSno          INT,
                                    Led_Desc        VARCHAR(100),
                                    Grp_Nature      TINYINT,
                                    Credit          MONEY,
                                    Debit           MONEY,
                                    Amount          MONEY,                                    
                                    Cancel_Status   BIT)
        
              IF @YearFrom = 0
                  SET @YearFrom = @AsOn
              SET @PrvYear = @YearFrom -1

              SELECT    @Grp_Desc = Grp_Desc +'%',@Grp_Nature = Grp_Nature
              FROM		Ledger_Groups
              WHERE     GrpSno = @GrpSno
        
              INSERT INTO	@Mytable
				  SELECT        Vou_Date, LedSno, Led_Desc, Grp_Nature, Credit, Debit, Amount, Cancel_Status
				  FROM			VW_BILLWISEDETAILS
				  WHERE         (@BranchSno =0 OR BranchSno = @BranchSno) AND (CompSno= @CompSno)

					Union All

				  SELECT        0 AS Vou_Date,Lm.LedSno, Lm.Led_Desc + CAST(Lm.LedSno AS VARCHAR(10)) AS Led_Desc,Lg.Grp_Nature, 0 AS Credit, 0 AS Debit, 0 AS Amount,1 AS Cancel_Status
				  FROM          Ledgers lm 
								        Inner Join Ledger_Groups Lg On Lm.GrpSno = Lg.GrpSno
				  WHERE			    (Lm.Std_No = 3) AND (lm.CompSno=@CompSno)
        
			SELECT      @Bal =  CASE WHEN @Grp_Nature = 0 THEN
                                  (SELECT SUM(Amount) FROM  @Mytable
                                   WHERE (Grp_Nature = 0 OR Grp_Nature = 3 OR Grp_Nature = 4) AND Cancel_Status = 1 AND
                                  Vou_Date BETWEEN 0 AND @PrvYear)
                              WHEN @Grp_Nature = 1 OR @Grp_Nature = 2 THEN  --If this ledger GrpNature is Assets AND Liabilities
                                  (SELECT SUM(Amount) FROM @Mytable
                                  WHERE Led_Desc LIKE @Grp_Desc AND Cancel_Status = 1 AND
                                  Vou_Date BETWEEN 0 AND @AsOn)
                              ELSE -- ELSE it should be Income AND exp
                                  (SELECT SUM(Amount) FROM @Mytable
                                  WHERE Led_Desc LIKE @Grp_Desc AND Cancel_Status = 1 AND
                                  Vou_Date BETWEEN @YearFrom AND @AsOn)
                          END
              SELECT      @Bal = ISNULL(@Bal,0)
              RETURN      @Bal
          END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetLedBalance') BEGIN DROP FUNCTION Udf_GetLedBalance END
  GO

CREATE FUNCTION Udf_GetLedBalance(@LedSno AS INTEGER ,@AsOn AS INTEGER ,@YearFrom AS INTEGER = 0, @BranchSno AS integer,@CompSno INT)
        RETURNS MONEY
        WITH ENCRYPTION
        AS
          BEGIN
              DECLARE @GrpNature      TINYINT
              DECLARE @PrvYear        INTEGER
              DECLARE @Bal            MONEY
              If @YearFrom = 0
                  SET @YearFrom = @AsOn
              SET @PrvYear= @YearFrom -1
              SELECT  @GrpNature = gm.Grp_Nature
              FROM    Ledgers lm 
						Inner Join Ledger_Groups gm On lm.GrpSno = gm.GrpSno
              WHERE   (lm.LedSno = @LedSno)

              If @GrpNature = 1 OR @GrpNature = 2
                  SELECT        @Bal = SUM(Amount)
                  FROM			VW_BILLWISEDETAILS
                  WHERE         LedSno = @LedSno
                                AND (Vou_Date BETWEEN 0 AND @AsOn)
                                AND Cancel_Status = 1
                                AND (@BranchSno = 0 OR BranchSno = @BranchSno)                                
              ELSE If @GrpNature = 0
                  SELECT        @Bal = SUM(Amount)
                  FROM		VW_BILLWISEDETAILS
                  WHERE			(Grp_Nature = 0 OR Grp_Nature = 3 OR Grp_Nature = 4)
                          AND (Vou_Date BETWEEN 0 AND @PrvYear)
                          AND Cancel_Status = 1
                          AND (@BranchSno = 0 OR BranchSno = @BranchSno)
                          AND CompSno=@CompSno
                          
              ELSE
                  SELECT      @Bal = SUM(Amount)
                  FROM			VW_BILLWISEDETAILS
                  WHERE       LedSno = @LedSno
                          AND (Vou_Date BETWEEN @YearFrom AND @AsOn)
                          AND Cancel_Status = 1
                          AND (@BranchSno = 0 OR BranchSno = @BranchSno)
                          
              SELECT      @Bal = ISNULL(@Bal,0)
              RETURN      @Bal
          END

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetLedgerTransaction') BEGIN DROP FUNCTION Udf_GetLedgerTransaction END
GO
  
CREATE FUNCTION Udf_GetLedgerTransaction( @GrpDesc VARCHAR(100),@FromDt AS INTEGER ,@ToDt AS INTEGER,@YearFrom AS INTEGER,@BranchSno AS INTEGER,@CompSno INT)
        RETURNS @RetResult TABLE (LedSno     INT, Led_Desc    VARCHAR(100), OpnCr     MONEY, OpnDr     MONEY, TrnCr     MONEY, TrnDr     MONEY, ClsCr     MONEY, ClsDr     MONEY)
  WITH ENCRYPTION
        AS
          BEGIN
            DECLARE @PandL_Sno      INT
            DECLARE @PandL_HeadNo   VARCHAR(100)

            SELECT  @PandL_Sno = lm.LedSno, @PandL_HeadNo = lm.Led_Desc + CAST(lm.LedSno AS VARCHAR(10))
            FROM    Ledgers lm 
					          INNER JOIN Ledger_Groups gm On lm.GrpSno = gm.GrpSno
            WHERE   CompSno=@CompSno AND lm.Std_No = 3 --  Profit & Loss a/c

            INSERT @RetResult
              SELECT    Coalesce(T1.LedSno,T2.LedSno) LedSno,
                        Coalesce(T1.Led_Desc,T2.Led_Desc) Led_Desc,
                        OpnCr = CASE When OpnAmt > 0 Then Abs(OpnAmt) ELSE 0 END,
                        OpnDr = CASE When OpnAmt < 0 Then Abs(OpnAmt) ELSE 0 END,
                        TrnCr = ISNULL(T1.TrnCr, 0),
                        TrnDr = ISNULL(T1.TrnDr, 0),
                        ClsCr = CASE When ISNULL(OpnAmt,0)+IsNull(TrnCr,0)-ISNULL(TrnDr,0) > 0 Then Abs(ISNULL(OpnAmt,0)+IsNull(TrnCr,0)-ISNULL(TrnDr,0)) ELSE 0 END,
                        ClsDr = CASE When ISNULL(OpnAmt,0)+IsNull(TrnCr,0)-ISNULL(TrnDr,0) < 0 Then Abs(ISNULL(OpnAmt,0)+IsNull(TrnCr,0)-ISNULL(TrnDr,0)) ELSE 0 END

                        

              FROM      ( SELECT      LedSno,Led_Desc,SUM(Credit) AS TrnCr, SUM(Debit) AS TrnDr
                          FROM        VW_BILLWISEDETAILS
					                WHERE       Cancel_Status = 1 AND (Vou_Date BETWEEN @FromDt AND @ToDt) AND (CompSno=@CompSno) AND (@BranchSno =0 OR BranchSno =@BranchSno)
                                      AND Led_Desc LIKE @GrpDesc
                          GROUP BY    LedSno,Led_Desc) T1

                          Full OUTER JOIN 
        
                          ( SELECT        @PandL_Sno AS LedSno,@PandL_HeadNo AS Led_Desc,SUM(Amount) AS OpnAmt
                            FROM			    VW_BILLWISEDETAILS
                            WHERE			    Cancel_Status = 1 AND (Vou_Date BETWEEN 0 AND @FromDt-1) AND (Grp_Nature = 0 OR Grp_Nature = 3 OR Grp_Nature = 4)
                                          AND (CompSno=@CompSno)
							                            AND (@BranchSno =0 OR BranchSno = @BranchSno)AND Led_Desc LIKE @GrpDesc
                            UNION ALL

                            SELECT      LedSno,Led_Desc,SUM(Amount) AS OpnAmt
                            FROM			  VW_BILLWISEDETAILS
                            WHERE       (Vou_Date BETWEEN 0 AND @FromDt-1) AND Cancel_Status = 1 AND (Grp_Nature = 1 OR Grp_Nature = 2) AND (CompSno=@CompSno)
                                        AND (@BranchSno =0 OR BranchSno =@BranchSno)AND Led_Desc LIKE @GrpDesc
                            GROUP BY    LedSno,Led_Desc) T2

                            On T1.LedSno = T2.LedSno 
            RETURN
          END

GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_GetBalanceSheet') BEGIN DROP FUNCTION Udf_GetBalanceSheet END
GO


CREATE FUNCTION Udf_GetBalanceSheet(@FromDt INTEGER, @ToDt   INTEGER, @Grouped Bit=1, @ValutionMethod TinyInt, @BranchSno AS INTEGER,@CompSno INT)
RETURNS @RetResult TABLE(Sno      INTEGER,
          [Name]      VARCHAR(50),
          [Grp_Level]     INTEGER,
          IsGrp       BIT,
          HDesc      VARCHAR(100),
          Grp_Nature   TINYINT,
          Affect_Gp    BIT,
          Amount      MONEY)
WITH ENCRYPTION
AS
  BEGIN
      DECLARE @PrvYearTo  INTEGER
      DECLARE @OpnPL      MONEY
      DECLARE @CurPL      MONEY
      DECLARE @TrnPL      MONEY
      DECLARE @MyTable    TABLE(LedSno INT,Led_Desc VARCHAR(100),Amount MONEY)
      DECLARE @LedList    TABLE(Sno INT,[Name] VARCHAR(50), [Grp_Level] INT, IsGrp BIT, hDesc VARCHAR(100), Grp_Nature TINYINT, Affect_Gp BIT,CompSno INT)
        
      SET @PrvYearTo      = @FromDt-1
      INSERT INTO @MyTable
      SELECT  LedSno, Led_Desc,Amount
      FROM VW_BILLWISEDETAILS
      WHERE   (Grp_Nature=1 OR Grp_Nature=2)AND (Cancel_Status=1)AND
          (Vou_Date BETWEEN 0 AND @ToDt)AND
          (@BranchSno=0 OR BranchSno=@BranchSno) AND
          (CompSno=@CompSno)
        
      -- find PrvYear P&L AND assign to @OpnPL
      SELECT @OpnPL = [dbo].Udf_GetLedBalance( (SELECT LedSno FROM Ledgers WHERE Std_No=3 AND CompSno=@CompSno),@FromDt,0,@BranchSno,@CompSno)
      SELECT @OpnPL = ISNULL(@OpnPL,0)
      INSERT INTO @MyTable VALUES(0,'G001GL000L3LBAL',@OpnPL)
        
      -- find CurPeriod P&L AND assign to @CurPL
      SELECT  @CurPL = SUM(Amount) FROM  VW_BILLWISEDETAILS
      WHERE   (Grp_Nature=3 OR Grp_Nature=4)AND (Cancel_Status = 1)AND
          (Vou_Date BETWEEN @FromDt AND @ToDt)  AND
          (@BranchSno=0 OR BranchSno=@BranchSno) AND
          (CompSno=@CompSno)

      SELECT  @CurPL = ISNULL(@CurPL,0)
      INSERT INTO @MyTable VALUES(0,'G001GL000L3LCUR',@CurPL)
        
      -- find Transferred P&L AND assign to @TrnPL
      SELECT  @TrnPL = SUM(Amount) FROM  VW_BILLWISEDETAILS
      WHERE   (LedSno=(SELECT LedSno FROM Ledgers WHERE Std_No=3 AND CompSno=@CompSno)) AND (Cancel_Status = 1)AND
          (Vou_Date BETWEEN @FromDt AND @ToDt)  AND
          (@BranchSno=0 OR BranchSno=@BranchSno) AND
          (CompSno=@CompSno)
      INSERT INTO @MyTable VALUES(0,'G001GL000L3LTRN',@TrnPL)
        
      INSERT INTO @LedList SELECT * FROM  VW_LEDGERS WHERE Grp_Nature =1 OR Grp_Nature = 2 AND CompSno=@CompSno
        
      -- in the above cond profit & Loss a/c will not be added,Bcoz its GrpNature is 0,AND also we should change Isgrp = 1 so that we add manualy
      INSERT INTO @LedList SELECT Sno,[Name],[Grp_Level],1,hDesc,Grp_Nature,Affect_Gp,CompSno FROM  VW_LEDGERS WHERE Grp_Nature = 0 AND Sno =(SELECT LedSno FROM Ledgers WHERE Std_No=3 AND CompSno=@CompSno) AND CompSno=@CompSno
        
      -- under prpfit & loss, the following ledger should be added, to show detail of P&L
      INSERT INTO @LedList VALUES(0,'Opening Balance',2,0,'G001GL000L3LBAL',0,0,@CompSno)
      INSERT INTO @LedList VALUES(0,'Current Period',2,0,'G001GL000L3LCUR',0,0,@CompSno)
      INSERT INTO @LedList VALUES(0,'Transferred',2,0,'G001GL000L3LTRN',0,0,@CompSno)
        
      INSERT @RetResult
      SELECT	Sno,[Name],[Grp_Level],IsGrp,hDesc,Grp_Nature,Affect_Gp,
		Amount= (SELECT ISNULL(SUM(Amount),0)
				FROM		@MyTable
					WHERE		Led_Desc LIKE hDesc OR Led_Desc LIKE hdesc + 'G%' OR Led_Desc LIKE hdesc + 'L%') * CASE When Grp_Nature = 2 Then -1 ELSE 1 END
					FROM		@LedList
					WHERE		(@Grouped = 0 OR IsGrp =@Grouped) AND [Grp_Level] = 1 OR [Grp_Level] = CASE When @Grouped = 1 Then 1 ELSE 2 END
					ORDER BY	Grp_Nature,hDesc
      RETURN
  END

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SP_TrialBalance') BEGIN DROP PROCEDURE SP_TrialBalance END
GO
CREATE Procedure SP_TrialBalance (@GrpSno AS INT, @FromDt AS INT, @ToDt AS INT, @BranchSno AS INT, @CompSno INT)
WITH ENCRYPTION
AS 

  SET NoCount On

  DECLARE     @YearFrom   INTEGER
  DECLARE     @GrpDesc  VARCHAR(100)
  DECLARE     @Grp_Level   INTEGER
  DECLARE     @MyTable    TABLE (LedSno INT,Led_Desc VARCHAR(100),OpnCr MONEY,OpnDr MONEY,TrnCr MONEY,TrnDr MONEY,ClsCr MONEY,ClsDr MONEY)
  SELECT      @YearFrom   = [dbo].GetFinYrFromDt(@FromDt)
  SELECT      @GrpDesc = Grp_Desc +'%', @Grp_Level = Grp_Level+1 FROM Ledger_Groups WHERE GrpSno = @GrpSno

  INSERT INTO   @MyTable
  SELECT		LedSno,Led_Desc,OpnCr,OpnDr,TrnCr,TrnDr,ClsCr,ClsDr
  FROM			Udf_GetLedgerTransaction(@GrpDesc,@FromDt, @ToDt, @YearFrom,@BranchSno,@CompSno)
        
  SELECT      Sno,IsGrp, [Name],hDesc,[Grp_Level],Grp_Nature,Affect_Gp,
              (SELECT ISNULL(SUM(OpnCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') OpnCr,
              (SELECT ISNULL(SUM(OpnDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') OpnDr,
              (SELECT ISNULL(SUM(TrnCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') TrnCr,
              (SELECT ISNULL(SUM(TrnDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') TrnDr,
              (SELECT ISNULL(SUM(ClsCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') ClsCr,
              (SELECT ISNULL(SUM(ClsDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') ClsDr
  FROM			  VW_LEDGERS
  WHERE       hDesc LIKE @GrpDesc AND [Grp_Level] = @Grp_Level AND Sno <> 1 AND CompSno=@CompSno
  GROUP BY    Sno,IsGrp, [Name], hdesc, [Grp_Level], Grp_Nature, Affect_Gp
  ORDER BY    IsGrp Desc,hdesc,[Name]
GO

  
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SP_TrialBalance_LedWise') BEGIN DROP PROCEDURE SP_TrialBalance_LedWise END
GO
CREATE PROCEDURE SP_TrialBalance_LedWise(@GrpSno AS INT, @FromDt AS INT, @ToDt AS INT, @BranchSno AS INT, @CompSno INT)
  WITH ENCRYPTION
  AS
    SET NOCOUNT ON
    DECLARE     @YearFrom		AS INT
    DECLARE     @Grp_Desc		AS VARCHAR(100)
    SELECT      @YearFrom   = [dbo].GetFinYrFromDt(@FromDt)
    SELECT      @Grp_Desc  = Grp_Desc +'%' FROM Ledger_Groups WHERE GrpSno = @GrpSno
    DECLARE     @MyTable    TABLE (LedSno INT,Led_Desc VARCHAR(100),OpnCr MONEY,OpnDr MONEY,TrnCr MONEY,TrnDr MONEY,ClsCr MONEY,ClsDr MONEY)
        
    INSERT INTO @MyTable
    SELECT      LedSno,Led_Desc,OpnCr,OpnDr,TrnCr,TrnDr,ClsCr,ClsDr FROM [dbo].[Udf_GetLedgerTransaction](@Grp_Desc,@FromDt, @ToDt, @YearFrom, @BranchSno, @CompSno)

    SELECT      Sno,IsGrp, [Name],hDesc,[Grp_Level],Grp_Nature,Affect_Gp,
                (SELECT ISNULL(SUM(OpnCr),0)FROM @MyTable  WHERE LedSno= vl.Sno) OpnCr,
                (SELECT ISNULL(SUM(OpnDr),0)FROM @MyTable  WHERE LedSno= vl.Sno) OpnDr,
                (SELECT ISNULL(SUM(TrnCr),0)FROM @MyTable  WHERE LedSno= vl.Sno) TrnCr,
                (SELECT ISNULL(SUM(TrnDr),0)FROM @MyTable  WHERE LedSno= vl.Sno) TrnDr,
                (SELECT ISNULL(SUM(ClsCr),0)FROM @MyTable  WHERE LedSno= vl.Sno) ClsCr,
                (SELECT ISNULL(SUM(ClsDr),0)FROM @MyTable  WHERE LedSno= vl.Sno) ClsDr
    FROM        VW_LEDGERS vl
    WHERE       IsGrp = 0 AND hDesc LIKE @Grp_Desc AND CompSno=@CompSno
    GROUP BY    vl.Sno,vl.isgrp,vl.[Name], vl.hDesc, vl.[Grp_Level], vl.Grp_Nature, vl.Affect_Gp
    ORDER BY    [Name]


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SSP_TrialBalanceDetailed') BEGIN DROP PROCEDURE SSP_TrialBalanceDetailed END
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SP_TrialBalance_Detailed') BEGIN DROP PROCEDURE SP_TrialBalance_Detailed END
GO
CREATE PROCEDURE SP_TrialBalance_Detailed(@GrpSno AS INT, @FromDt AS INT, @ToDt AS INT, @BranchSno AS INT, @CompSno INT)
WITH ENCRYPTION
    AS
      SET NOCOUNT ON
      DECLARE     @YearFrom   INTEGER
      DECLARE     @GrpDesc  VARCHAR(100)
      DECLARE     @Grp_Level   INTEGER
      DECLARE     @MyTable    TABLE (LedSno INT,Led_Desc VARCHAR(100),OpnCr MONEY,OpnDr MONEY,TrnCr MONEY,TrnDr MONEY,ClsCr MONEY,ClsDr MONEY)

      SELECT      @YearFrom   = [dbo].GetFinYrFromDt(@FromDt)
      SELECT      @GrpDesc  = Grp_Desc +'%',@Grp_Level=Grp_Level+1 FROM Ledger_Groups WHERE GrpSno = @GrpSno

      INSERT INTO     @MyTable
      SELECT      LedSno,Led_Desc,OpnCr,OpnDr,TrnCr,TrnDr,ClsCr,ClsDr FROM [dbo].[Udf_GetLedgerTransaction](@GrpDesc,@FromDt, @ToDt, @YearFrom, @BranchSno, @CompSno)
      SELECT      Sno,IsGrp, [Name],hDesc,[Grp_Level],Grp_Nature,Affect_Gp,
                  (SELECT ISNULL(SUM(OpnCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') OpnCr,
                  (SELECT ISNULL(SUM(OpnDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') OpnDr,
                  (SELECT ISNULL(SUM(TrnCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') TrnCr,
                  (SELECT ISNULL(SUM(TrnDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') TrnDr,
                  (SELECT ISNULL(SUM(ClsCr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') ClsCr,
                  (SELECT ISNULL(SUM(ClsDr),0)FROM @MyTable WHERE Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%') ClsDr
      FROM        VW_LEDGERS
      WHERE Sno <> 1 AND [Grp_Level] = 1 OR [Grp_Level] = 2 AND CompSno=@CompSno
      GROUP BY    Sno,IsGrp, [Name], hDesc, [Grp_Level], Grp_Nature, Affect_Gp
      ORDER BY    hDesc
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='SP_ProfitAndLoss') BEGIN DROP PROCEDURE SP_ProfitAndLoss END
GO

CREATE PROC SP_ProfitAndLoss(@FromDt AS INT,@ToDt AS INT,@Grouped   AS BIT, @BranchSno AS INTEGER, @CompSno INT)
WITH ENCRYPTION
AS
  SET NOCOUNT ON
  DECLARE @MyTable    TABLE(LedSno INT,Led_Desc VARCHAR(100),Amount MONEY)
  DECLARE @PrvYearTo  INTEGER
  SET @PrvYearTo      = @FromDt-1
  INSERT INTO @MyTable
  SELECT      LedSno, Led_Desc,Amount
  FROM VW_BILLWISEDETAILS
  WHERE       (Grp_Nature = 3 OR Grp_Nature = 4)    AND
                  (Cancel_Status = 1)            AND
                  (Vou_Date BETWEEN @FromDt AND @ToDt)  AND
                  (@BranchSno = 0 OR BranchSno = @BranchSno) AND
                  (CompSno=@CompSno)

  DECLARE     @LedList TABLE( Sno         INT,
                  [Name]      VARCHAR(50),
                  [Grp_Level]     INT,
                  IsGrp       BIT,
                  hDesc      VARCHAR(100),
                  Grp_Nature   TINYINT,
                  Affect_Gp    BIT,
                  CompSno INT)
  INSERT INTO @LedList
  SELECT * FROM  VW_LEDGERS WHERE (CompSno=@CompSno) AND (Grp_Nature =3 OR Grp_Nature = 4) 
        
  SELECT      Sno,[Name],[Grp_Level],IsGrp,hDesc,Grp_Nature,Affect_Gp,
              Amount=(SELECT  ISNULL(SUM(Amount),0)
                      FROM        @MyTable
                      WHERE       Led_Desc LIKE hDesc OR Led_Desc LIKE hDesc + 'G%' OR Led_Desc LIKE hDesc + 'L%')
                  ----Led_Desc LIKE hDesc + '%'
  FROM        @LedList
  WHERE       (@Grouped = 0 OR IsGrp =@Grouped) AND [Grp_Level] = 1 OR [Grp_Level] = CASE When @Grouped = 1 Then 1 ELSE 2 END
  ORDER BY    Affect_Gp Desc,Grp_Nature,hDesc

 GO
 
 
IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Transactions') BEGIN DROP PROCEDURE Sp_Transactions END
GO
CREATE PROCEDURE Sp_Transactions
	  @TransSno           INT,
    @Trans_No           VARCHAR(20),
    @Trans_Date         INT,
    @VouTypeSno         INT,
    @SeriesSno          INT,
    @Payment_Type       TINYINT,
    @ClientSno          INT,
    @Due_Date           INT,
    @RefSno             INT,
    @BarCodeRefSno      INT,
    @TotAmount          MONEY,
    @TaxPer             DECIMAL(4,2),
    @TaxAmount          MONEY,
    @RevAmount          MONEY,
    @NettAmount         MONEY,
    @Fixed_Price        MONEY,
    @Commision          DECIMAL(5,2),
    @Remarks            VARCHAR(100),
    @Print_Remarks      VARCHAR(100),

    @Ref_Amount      MONEY,
    @Doc_Balance_Amt MONEY,

    @Locked             BIT,
    @CompSno            INT,
    @UserSno            INT,
    @VouSno             INT,    
	  @ItemDetailXML			XML,
	  @ImageDetailXML			XML,    
	  @PaymentModesXML		XML,
	  @RetSno					    INT OUTPUT,
	  @RetTrans_No			  VARCHAR(20) OUTPUT

  AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION

    IF (@VouTypeSno=0) OR (@SeriesSno=0) OR (@UserSno=0) OR (@CompSno=0)
      BEGIN
          Raiserror ('Server responded with some mandatory values missing like VouType, Series, User, Party or Company', 16, 1) 
          GOTO CloseNow
      END

	IF EXISTS(SELECT TransSno FROM Transactions WHERE TransSno=@TransSno)
			BEGIN
			  UPDATE    Transactions
                  SET Trans_No=@Trans_No,Trans_Date=@Trans_Date,VouTypeSno=@VouTypeSno,SeriesSno=@SeriesSno,Payment_Type=@Payment_Type,ClientSno=@ClientSno,Due_Date=@Due_Date,RefSno=@RefSno,BarCodeRefSno=@BarCodeRefSno,
                  TotAmount=@TotAmount,TaxPer=@TaxPer,TaxAmount=@TaxAmount,RevAmount=@RevAmount,NettAmount=@NettAmount,Fixed_Price=@Fixed_Price, Commision=@Commision,Remarks=@Remarks,Print_Remarks=@Print_Remarks,
                  Ref_Amount=@Ref_Amount, Doc_Balance_Amt=@Doc_Balance_Amt,
                  Locked=@Locked,CompSno=@CompSno,UserSno=@UserSno,VouSno=@VouSno
        WHERE     TransSno=@TransSno
				IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Transaction_Details WHERE TransSno = @TransSno
				IF @@ERROR <> 0 GOTO CloseNow

				DELETE FROM Image_Details WHERE TransSno = @TransSno AND Image_Grp=2
				IF @@ERROR <> 0 GOTO CloseNow

				DELETE FROM PaymentMode_Details WHERE TransSno = @TransSno 
				IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Barcoded_Items WHERE TransSno = @TransSno
        IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM Assay_Records WHERE BarCodeSno IN (SELECT BarCodeSno FROM Barcoded_Items WHERE TransSno=@TransSno)
			  IF @@ERROR <> 0 GOTO CloseNow

        DELETE FROM BarCoded_Items WHERE TransSno=@TransSno
			  IF @@ERROR <> 0 GOTO CloseNow
			END
		ELSE
			BEGIN

        DECLARE @Num_Method TINYINT
        SELECT @Num_Method=Num_Method FROM Voucher_Series WHERE SeriesSno=@SeriesSno

        IF (@Num_Method=2)
        BEGIN
            SET @Trans_No= [dbo].GenerateVoucherNo(@SeriesSno)               
        END

        IF EXISTS(SELECT TransSno FROM Transactions WHERE Trans_No=@Trans_No AND CompSno=@CompSno)
          BEGIN
              Raiserror ('Transaction exists with this Number', 16, 1) 
              GOTO CloseNow
          END

      	INSERT INTO Transactions  (Trans_No,Trans_Date,VouTypeSno,SeriesSno,Payment_Type,ClientSno,Due_Date,RefSno,BarCodeRefSno,TotAmount,TaxPer,TaxAmount,RevAmount,NettAmount,Fixed_Price,Commision,Remarks,
                                    Ref_Amount,Doc_Balance_Amt, Print_Remarks,Locked,CompSno,UserSno,VouSno)
        VALUES                    (@Trans_No,@Trans_Date,@VouTypeSno,@SeriesSno,@Payment_Type,@ClientSno,@Due_Date,@RefSno,@BarCodeRefSno,@TotAmount,@TaxPer,@TaxAmount,@RevAmount,@NettAmount,@Fixed_Price,@Commision,@Remarks,
                                    @Ref_Amount,@Doc_Balance_Amt,@Print_Remarks,@Locked,@CompSno,@UserSno,@VouSno)

				IF @@ERROR <> 0 GOTO CloseNow								
				SET @TransSno = @@IDENTITY

        IF (@Num_Method <> 0)
        BEGIN
          UPDATE Voucher_Series SET Current_No = Current_No + 1 WHERE SeriesSno=@SeriesSno
          IF @@ERROR <> 0 GOTO CloseNow
        END

			END

	    DECLARE	@IsOpen TINYINT = CASE WHEN @Trans_Date < (SELECT Fin_From FROM Companies WHERE CompSno=@CompSno) THEN 1 ELSE 2 END

      DECLARE  @VouDetailXML XML  = CAST([dbo].GetVoucherXML(@CompSno, @VouTypeSno, @ClientSno, @IsOpen, @NettAmount, @Payment_Type, CAST(@PaymentModesXML AS VARCHAR(MAX))) AS XML)  
      
      EXEC Sp_AccVouchers @VouSno, @VouTypeSno, @SeriesSno, @Trans_No,  @Trans_Date, '', 0, 1, 0, @UserSno, @CompSno, @VouDetailXML, @VouSno OUTPUT
      UPDATE Transactions SET VouSno=@VouSno WHERE TransSno=@TransSno
      IF @@ERROR <> 0 GOTO CloseNow

      DECLARE @RecdPurity DECIMAL(5,2) --ONLY IF IT IS LAB TESTING RECEIPT. THIS IS TO UPDATE PURITY OF PREVIOUS ITEMS IN DETAILS TABLE
      DECLARE @RecdBarCodeSno INT =0

   IF @ItemDetailXML IS NOT NULL
          BEGIN
              --For Inserting into Subtable
              DECLARE @idoc         INT
              DECLARE @doc          XML
              DECLARE @Sno          INT
              DECLARE @BarCodeSno   INT
              DECLARE @ItemSno      INT
              DECLARE @Item_Desc      VARCHAR(50)
              DECLARE @UomSno       INT
              DECLARE @Karat        DECIMAL(4,2)
              DECLARE @Purity       DECIMAL(5,2)
              DECLARE @Qty          SMALLINT
              DECLARE @GrossWt      DECIMAL(8,2)
              DECLARE @StoneWt      DECIMAL(8,2)
              DECLARE @Wastage      DECIMAL(8,2)
              DECLARE @NettWt       DECIMAL(8,2)
              DECLARE @PureWt       DECIMAL(8,2)
              DECLARE @Rate         MONEY
              DECLARE @Amount       MONEY
                                            
              /*Declaring Temporary Table for Details Table*/
              DECLARE @DetTable Table
              (
                  Sno INT IDENTITY(1,1), BarCodeSno INT, ItemSno INT, Item_Desc VARCHAR(50), UomSno INT, Karat DECIMAL(4,2), Purity DECIMAL(5,2), Qty SMALLINT, GrossWt DECIMAL(8,2), StoneWt DECIMAL(8,2), Wastage DECIMAL(8,2), NettWt DECIMAL(8,2), PureWt DECIMAL(8,2), Rate MONEY, Amount MONEY)
              Set @doc=@ItemDetailXML
              Exec sp_xml_preparedocument @idoc Output, @doc
             
              /*Inserting into Temporary Table from Passed XML File*/
              INSERT INTO @DetTable
              (
                  BarCodeSno, ItemSno, Item_Desc, UomSno, Karat, Purity, Qty, GrossWt, StoneWt, Wastage, NettWt, PureWt, Rate, Amount
              )
             
              SELECT  * FROM  OpenXml 
              (
                  @idoc, '/ROOT/Transaction/Transaction_Details',2
              )
              WITH 
              (
                  BarCodeSno INT '@BarCodeSno', ItemSno INT '@ItemSno', Item_Desc VARCHAR(50) '@Item_Desc', UomSno INT '@UomSno', Karat DECIMAL(4,2) '@Karat', Purity DECIMAL(5,2) '@Purity', Qty SMALLINT '@Qty', GrossWt DECIMAL(8,2) '@GrossWt', StoneWt DECIMAL(8,2) '@StoneWt', Wastage DECIMAL(8,2) '@Wastage', NettWt DECIMAL(8,2) '@NettWt', PureWt DECIMAL(8,2) '@PureWt', Rate MONEY '@Rate', Amount MONEY '@Amount'
              )

              SELECT  TOP 1   @Sno=Sno,@BarCodeSno=BarCodeSno, @ItemSno=ItemSno, @Item_Desc=Item_Desc, @UomSno=UomSno, @Karat=Karat, @Purity=Purity, @Qty=Qty, @GrossWt=GrossWt, @StoneWt=StoneWt, @Wastage=Wastage,
                              @NettWt=NettWt, @PureWt=PureWt, @Rate=Rate, @Amount=Amount
              FROM            @DetTable

              DECLARE @LastQty INT = 0
              /*Taking from Temporary Details Table and inserting into details table here*/
              WHILE @@ROWCOUNT <> 0 
                  BEGIN
                    DECLARE @DetSno INT

                      IF @VouTypeSno = 27  --ONLY IF IT IS LAB TESTING RECEIPT
                        BEGIN
                          SET @RecdBarCodeSno  = @BarCodeSno
                          SET @RecdPurity = @Purity

                        END
                        
                      INSERT INTO Transaction_Details(TransSno,BarCodeSno, ItemSno, Item_Desc, UomSno, Karat, Purity, Qty, GrossWt, StoneWt, Wastage, NettWt, PureWt, Rate, Amount) 
                      VALUES (@TransSno,@BarCodeSno, @ItemSno, @Item_Desc, @UomSno, @Karat, @Purity, @Qty, @GrossWt, @StoneWt, @Wastage, @NettWt, @PureWt, @Rate, @Amount)
                      IF @@Error <> 0 GOTO CloseNow
                      SET @DetSno = @@IDENTITY

                      /* IF THIS DOCUMENT IS RCTI THEN UPDATE THE RATE AND AMOUNT OF THE BARCODED ITEM OF GRIN ----------------------*/
                      
                      IF @VouTypeSno = 12
                        BEGIN
                          IF @RefSno <> 0
                            BEGIN
                              UPDATE Transaction_Details SET Rate=@Rate, Amount=@Amount WHERE TransSno=@RefSno AND  DetSno = (SELECT DetSno FROM Barcoded_Items WHERE BarCodeSno=@BarCodeSno)
                              IF @@Error <> 0 GOTO CloseNow
                            END
                          DECLARE @GrnTransSno INT
                          SELECT @GrnTransSno=TransSno FROM Barcoded_Items WHERE BarCodeSno=@BarCodeSno
                        END

                      /* ------------------------------------------------------------------------------------------------------------*/


                      DECLARE @Require_LabTest BIT = 0
                      
                      IF @VouTypeSno <> 27
                        BEGIN
                          SELECT @Require_LabTest= Require_LabTest FROM Items WHERE ItemSno=@ItemSno
                        END

                      --GENERATING AND INSERTING BARCODES FOR THE ITEMS WITH QTY
                      DECLARE @Stock_Type TINYINT
                      SELECT @Stock_Type = Stock_Type FROM Voucher_Types WHERE VouTypeSno=@VouTypeSno

                      DECLARE @RefVouTypeSno INT = 0
                      DECLARE @RefStockType TINYINT = 0
                      
                      IF @RefSno <> 0
                        BEGIN                          
                          SELECT @RefVouTypeSno = VouTypeSno FROM Transactions WHERE TransSno = @RefSno                          
                          SELECT @RefStockType=Stock_Type FROM Voucher_Types WHERE VouTypeSno = @RefVouTypeSno
                        END

                      DECLARE @NewBarCodeSno INT

                      IF (@Stock_Type = 1) AND (@RefSno = 0 OR @RefStockType <> 1)
                        BEGIN
                          DECLARE @TmpQty INT = 1
                          WHILE @TmpQty <= @Qty
                            BEGIN
                            
                              INSERT INTO Barcoded_Items(TransSno, DetSno, ItemSno, BarCode_No)
                              VALUES (@TransSno, @DetSno, @ItemSno,@Trans_No+'/'+CAST(@TmpQty+@LastQty AS varchar))
                              IF @@Error <> 0 GOTO CloseNow
                              SET @NewBarCodeSno=@@IDENTITY

                              /* THIS IS TO UPDATE THE NEWLY CREATED BARCODED ITEM FOR THE ITEM INSERTED (SELF) */
                              UPDATE Transaction_Details SET BarSelfSno=@NewBarCodeSno WHERE DetSno=@DetSno
                              
                              IF @Require_LabTest = 1
                              BEGIN
                                INSERT INTO Assay_Records(BarCodeSno) VALUES (@NewBarCodeSno)
                              END

                              SET @TmpQty = @TmpQty + 1
                              SET @LastQty = @LastQty +1
                            END
                        END

                      DELETE FROM @DetTable WHERE Sno = @Sno

                    SELECT  TOP 1   @Sno=Sno,@BarCodeSno=BarCodeSno, @ItemSno=ItemSno, @Item_Desc=Item_Desc, @UomSno=UomSno, @Karat=Karat, @Purity=Purity, @Qty=Qty, @GrossWt=GrossWt, @StoneWt=StoneWt, @Wastage=Wastage,
                                    @NettWt=NettWt, @PureWt=PureWt, @Rate=Rate, @Amount=Amount
                    FROM            @DetTable
                  END
              Exec Sp_Xml_Removedocument @idoc
          END

    IF @VouTypeSno = 27
      BEGIN
        UPDATE Transaction_Details SET Purity = @RecdPurity WHERE BarCodeSno=@RecdBarCodeSno
        IF @@ERROR <> 0 GOTO CloseNow			
        UPDATE Transaction_Details SET Purity = @RecdPurity WHERE DetSno = (SELECT DetSno FROM BarCoded_Items WHERE BarCodeSno=@BarCodeSno)
        IF @@ERROR <> 0 GOTO CloseNow			        
      END

   IF @ImageDetailXML IS NOT NULL
              BEGIN                     

                  DECLARE @idoc1       INT
                  DECLARE @doc1        XML
                  DECLARE @Image_Name  VARCHAR(50)
                  DECLARE @Image_Url   VARCHAR(100)
                                              
                  /*Declaring Temporary Table for Details Table*/
                  DECLARE @ImgTable Table
                  (
                      Sno INT IDENTITY(1,1),Image_Name VARCHAR(50), Image_Url VARCHAR(200)
                  )
                  Set @doc1=@ImageDetailXML
                  Exec sp_xml_preparedocument @idoc1 Output, @doc1
             
                  /*Inserting into Temporary Table from Passed XML File*/
                  INSERT INTO @ImgTable
                  (
                      Image_Name, Image_Url
                  )
             
                  SELECT  * FROM  OpenXml 
                  (
                      @idoc1, '/ROOT/Images/Image_Details',2
                  )
                  WITH 
                  (
                      Image_Name VARCHAR(50) '@Image_Name', Image_Url VARCHAR(100) '@Image_Url'
                  )
                  SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
                  FROM @ImgTable
                  
                  /*Taking from Temporary Details Table and inserting into details table here*/
                  WHILE @@ROWCOUNT <> 0 
                      BEGIN
                          INSERT INTO [dbo].Image_Details(TransSno,Image_Grp, Image_Name, Image_Url,CompSno) 
                          VALUES (@TransSno,2, @Image_Name, (@Image_Url + '/'+@Trans_No+'/'+ @Image_Name),@CompSno)
                          IF @@Error <> 0 GOTO CloseNow
             
                          DELETE FROM @ImgTable WHERE Sno = @Sno
                          SELECT  TOP 1 @Sno=Sno,@Image_Name=Image_Name, @Image_Url=Image_Url
                          FROM   @ImgTable
                      END
                  Exec Sp_Xml_Removedocument @idoc1
            END
            
   IF @PaymentModesXML IS NOT NULL
      BEGIN
			DECLARE @XmlPrefix VARCHAR(20) =  '<ROOT> <Voucher>'
			DECLARE @XmlSuffix VARCHAR(20) =  '</Voucher> </ROOT> '
			SET @PaymentModesXML = @XmlPrefix + CAST(@PaymentModesXML AS VARCHAR(MAX)) + @XmlSuffix
         DECLARE @idoc2       INT
         DECLARE @Sno2        INT 
         DECLARE @LedSno      INT
         DECLARE @Debit       MONEY
         DECLARE @Credit      MONEY
         DECLARE @Trans_Type  TINYINT
         DECLARE @PayRemarks  VARCHAR(50)

         DECLARE @DetTable2 TABLE
             (
             Sno INT IDENTITY(1,1),LedSno INT,Debit MONEY,Credit MONEY, Trans_Type TINYINT, PayRemarks VARCHAR(50)
             )
         Exec sp_xml_preparedocument @idoc2 OUTPUT, @PaymentModesXML
        
         INSERT INTO @DetTable2
             (
              LedSno,Debit,Credit, Trans_Type, PayRemarks
             )
         SELECT  * FROM  OpenXml 
             (
              @idoc2, '/ROOT/Voucher/Voucher_Details',2
             )
         WITH 
            (
              LedSno INT '@LedSno',Debit MONEY '@Debit',Credit MONEY '@Credit', Trans_Type TINYINT '@Trans_Type', PayRemarks VARCHAR(50) '@PayRemarks'
            )
         SELECT      TOP 1 @Sno2=Sno, @LedSno=LedSno, @Debit=Debit, @Credit=Credit, @Trans_Type=Trans_Type, @PayRemarks=PayRemarks
                     FROM @DetTable2
        /*Taking FROM Temporary Details TABLE AND inserting INTO details TABLE here*/
         WHILE @@ROWCOUNT <> 0 
             BEGIN 
                 INSERT INTO PaymentMode_Details(TransSno,Trans_Type,LedSno,Amount,Remarks) 
                 VALUES (@TransSno,@Trans_Type,@LedSno,CASE WHEN @Debit=0 THEN @Credit ELSE @Debit END,@PayRemarks)
                 IF @@Error <> 0 GOTO CloseNow
                 DELETE FROM @DetTable2 WHERE Sno = @Sno2
                 
				 SELECT      TOP 1 @Sno2=Sno,@LedSno=LedSno,@Debit=Debit,@Credit=Credit, @Trans_Type=Trans_Type, @PayRemarks = PayRemarks
                 FROM        @DetTable2
             END
         Exec Sp_Xml_Removedocument @idoc2
      END
          
  SET @RetSno = @TransSno
  SET @RetTrans_No = @Trans_No
	COMMIT TRANSACTION
	RETURN @TransSno
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_TRANSACTIONS') BEGIN DROP VIEW VW_TRANSACTIONS END
GO

CREATE VIEW VW_TRANSACTIONS
WITH ENCRYPTION
AS
    SELECT      Trans.TransSno, Trans.Trans_No, Trans.Trans_Date, CAST([dbo].IntToDate(Trans.Trans_Date) as VARCHAR)  as Trans_DateStr, Trans.VouTypeSno, VTyp.VouType_Name, VTyp.Stock_Type, VTyp.Cash_Type,
                Trans.SeriesSno, Ser.Series_Name, Trans.Payment_Type, Trans.BarCodeRefSno,
                Trans.ClientSno, Clnt.Client_Name, Clnt.Client_Cat,
                Trans.Due_Date, Trans.RefSno, ISNULL(SUM(Det.Qty),0) as TotQty, Trans.Ref_Amount, Trans.Doc_Balance_Amt,

                ISNULL(SUM(Det.GrossWt * (CASE WHEN Um.Base_Qty=0 THEN 1 ELSE Um.Base_Qty END)),0) as TotGrossWt,
                ISNULL(SUM(Det.StoneWt * (CASE WHEN Um.Base_Qty=0 THEN 1 ELSE Um.Base_Qty END)),0) as TotStoneWt,
                ISNULL(SUM(Det.Wastage * (CASE WHEN Um.Base_Qty=0 THEN 1 ELSE Um.Base_Qty END)),0) as TotWastage,
                ISNULL(SUM(Det.NettWt  * (CASE WHEN Um.Base_Qty=0 THEN 1 ELSE Um.Base_Qty END)),0)  as TotNettWt,
                ISNULL(SUM(Det.PureWt * (CASE WHEN Um.Base_Qty=0 THEN 1 ELSE Um.Base_Qty END)),0)  as TotPureWt,

                Trans.TotAmount, Trans.TaxPer, Trans.TaxAmount, Trans.RevAmount, Trans.NettAmount, Trans.Fixed_Price, Trans.Commision, Trans.Remarks, Trans.Print_Remarks,
                Trans.Locked, Trans.CompSno,Trans.UserSno, Trans.VouSno,
                Pending_Status = CASE WHEN EXISTS (SELECT TransSno FROM Transactions WHERE RefSno=Trans.TransSno) THEN 1 ELSE 0 END

    FROM        Transactions Trans
                INNER JOIN Voucher_Types VTyp           ON VTyp.VouTypeSno = Trans.VouTypeSno
                INNER JOIN Voucher_Series Ser           ON Ser.SeriesSno = Trans.SeriesSno
                INNER JOIN Client Clnt                  ON Clnt.ClientSno = Trans.ClientSno
                LEFT OUTER JOIN Transaction_Details Det ON Det.TransSno = Trans.TransSno
                LEFT OUTER JOIN Uom Um                 ON Um.UomSno = Det.UomSno

    GROUP BY    Trans.TransSno, Trans.Trans_No, Trans.Trans_Date, Trans.VouTypeSno, VTyp.VouType_Name, VTyp.Stock_Type, VTyp.Cash_Type,
                Trans.SeriesSno, Ser.Series_Name,
                Trans.ClientSno, Clnt.Client_Name, Clnt.Client_Cat,
                Trans.Due_Date, Trans.RefSno,                
                Trans.TotAmount, Trans.TaxPer, Trans.TaxAmount, Trans.RevAmount, Trans.NettAmount,Trans.Remarks, Trans.Fixed_Price, Trans.Commision, Trans.Print_Remarks, Trans.Locked, Trans.CompSno,Trans.Payment_Type, Trans.BarCodeRefSno,  
                Trans.UserSno, Trans.VouSno,  Trans.Ref_Amount, Trans.Doc_Balance_Amt
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getTransactions') BEGIN DROP FUNCTION Udf_getTransactions END
GO

CREATE FUNCTION Udf_getTransactions(@TransSno INT,@VouTypeSno INT, @SeriesSno INT, @CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
RETURN
   	  SELECT      Trans.*, Trans.Trans_No  as 'Name', 'Date:' + CAST([dbo].IntToDate(Trans.Trans_Date) as VARCHAR)  as 'Details',
                  /* SERIES OBJECT  (SERIES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT Ser.*, Ser.Series_Name as 'Name', Ser.Series_Name as 'Details', VTyp.VouTypeSno as 'VouType.VouTypeSno', VTyp.VouType_Name as 'VouType.VouType_Name',
                          VTyp.Cash_Type as 'VouType.Cash_Type', VTyp.Stock_Type as 'VouType.Stock_Type'
                   FROM   Voucher_Series Ser
                          INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Ser.VouTypeSno
                   WHERE  SeriesSno = Trans.SeriesSno FOR JSON PATH) Series_Json,
                  ----------------------------------------------------------------------------------------------------------------------------------------------------------

                  /* CLIENT OBJECT (CLIENT JSON)------------------------------------------------------------------------*/
                  (SELECT     Clnt.*, Clnt.Client_Name as 'Name', Clnt.Client_Code as 'Details',
                              Profile_Image= CASE WHEN EXISTS(SELECT DetSno FROM Image_Details WHERE TransSno=Clnt.ClientSno AND Image_Grp=1 AND CompSno=@CompSno) THEN 'https://www.xauag.au/data/'+(SELECT TOP 1 Image_Url FROM Image_Details WHERE TransSno=Clnt.ClientSno AND Image_Grp=1 AND CompSno=@CompSno) ELSE '' END
                   FROM       Client Clnt WHERE ClientSno = Trans.ClientSno FOR JSON PATH) Client_Json,

                 ---------------------------------------------------------------------------------------------------
                 /* PAYMENT MODE JSON ---------------------------------- */
                  (SELECT Pm.*, Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details'  FROM PaymentMode_Details Pm INNER JOIN Ledgers Led ON Led.LedSno = Pm.LedSno WHERE TransSno = Trans.TransSno AND Trans_Type=1 FOR JSON PATH) PaymentModes_Json,
                 ---------------------------------------------------------------------------------------------------
                 
                  /* ITEMS OBJECT (ITEMS JSON)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT     Det.DetSno, Det.TransSno, Det.BarCodeSno, Det.ItemSno, Det.Item_Desc, Det.UomSno, Det.Karat, Det.Purity, Det.Qty, Det.GrossWt, Det.StoneWt, Det.Wastage, Det.NettWt,
                              Det.PureWt, Det.Rate, Det.Amount,
                              It.ItemSno as 'Item.ItemSno', It.Item_Name as 'Item.Item_Name', It.Item_Name as 'Item.Name', 'Code:' + It.Item_Code as 'Item.Details',
                              Um.UomSno as 'Uom.UomSno', Um.Uom_Name as 'Uom.Uom_Name', Um.Uom_Name as 'Uom.Name', 'Code:' + Um.Uom_Code as 'Uom.Details', Um.Base_Qty as 'Uom.Base_Qty',
                              ISNULL(Bar.BarCodeSno,0) as 'BarCode.BarCodeSno', ISNULL(Bar.BarCode_No,'') as 'BarCode.BarCode_No', ISNULL(Bar.BarCode_No,'') as 'BarCode.Name', + ISNULL(Bar.BarCode_No,'') as 'BarCode.Details',
                              ISNULL(BarSelf.BarCode_No,'') as BarSelf_No

                  FROM        Transaction_Details Det                    
                              INNER JOIN Items It On It.ItemSno=Det.ItemSno
                              INNER JOIN Uom Um ON Um.UomSno = Det.UomSno
                              LEFT OUTER JOIN Barcoded_Items Bar ON Bar.BarCodeSno = Det.BarCodeSno
                              LEFT OUTER JOIN Barcoded_Items BarSelf ON BarSelf.BarCodeSno = Det.BarSelfSno
                              
                  WHERE       Det.TransSno = Trans.TransSno FOR JSON PATH) Items_Json,
                  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
             
                  /* IMAGES OBJECT (IMAGES JSON)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
                  ISNULL((SELECT Img.Image_Name,'' as Image_File, Image_Url='https://www.xauag.au/data/'+Img.Image_Url, '1' as SrcType, 0 as DelStatus FROM Image_Details Img WHERE TransSno = Trans.TransSno AND Image_Grp=2 FOR JSON PATH),'') Images_Json,                      
                  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

                  /* PRINT REFERENCE OBJECT( ONLY FOR PRINTING PURPOSE)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
                  ISNULL((SELECT TransSno Trans_No, Trans_Date, Fixed_Price, Commision, TotNettWt, NettAmount FROM VW_TRANSACTIONS WHERE TransSno = Trans.RefSno FOR JSON PATH),'') as PrintReference_Json
                  ----------------------------------------------------------------------------------------------------------------------------------------------------------*/                  

      FROM        VW_TRANSACTIONS Trans                  

      WHERE       (Trans.TransSno=@TransSno OR @TransSno=0) AND (Trans.VouTypeSno=@VouTypeSno OR @VouTypeSno=0) AND (Trans.SeriesSno=@SeriesSno OR @SeriesSno=0) AND (Trans.CompSno=@CompSno)
      

GO




IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Transaction_Delete') BEGIN DROP PROCEDURE Sp_Transaction_Delete END
GO
CREATE PROCEDURE Sp_Transaction_Delete
	@TransSno INT
WITH ENCRYPTION AS
BEGIN
	SET NOCOUNT ON 
	BEGIN TRANSACTION					
      DECLARE @VouSno INT = (SELECT VouSno FROM Transactions WHERE TransSno=@TransSno)
      IF EXISTS (SELECT TransSno FROM Transactions WHERE RefSno=@TransSno)
        BEGIN
          Raiserror ('Cannot Delete. Transactions exists referring this Transaction', 16, 1) 
          GOTO CloseNow
        END
			DELETE FROM Transactions WHERE TransSno=@TransSno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM PaymentMode_Details WHERE TransSno=@TransSno 
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Vouchers WHERE VouSno=@VouSno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Voucher_Details WHERE VouSno=@VouSno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Transaction_Details WHERE TransSno=@TransSno
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Image_Details WHERE TransSno=@TransSno AND Image_Grp = 2
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM Assay_Records WHERE BarCodeSno IN (SELECT BarCodeSno FROM Barcoded_Items WHERE TransSno=@TransSno)
			IF @@ERROR <> 0 GOTO CloseNow

      DELETE FROM BarCoded_Items WHERE TransSno=@TransSno
			IF @@ERROR <> 0 GOTO CloseNow

      

	COMMIT TRANSACTION
	RETURN 1
CloseNow:
	ROLLBACK TRANSACTION
	RETURN 0
END
GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_STOCK_REGISTER') BEGIN DROP VIEW VW_STOCK_REGISTER END
GO

CREATE VIEW VW_STOCK_REGISTER
WITH ENCRYPTION AS
	SELECT		Trans.TransSno, VTyp.VouType_Name, Trans.Trans_No, Trans.Trans_Date, Trans.CompSno, 
				    Clnt.Client_Name, Det.Karat, Det.Purity,
				    Det.ItemSno, It.Item_Name, It.GrpSno, Grp.Grp_Name,
            UomSno    = (CASE WHEN Um.Base_Qty=0 THEN Det.UomSno ELSE Um.BaseUomSno END),
            Uom_Name  = (CASE WHEN Um.Base_Qty=0 THEN Um.Uom_Name ELSE Bum.Uom_Name END),
            ISNULL(Bar.BarCode_No,'') as BarCode_No,

				    InQty		    = CASE WHEN (VTyp.Stock_Type = 1 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 2 )) THEN Det.Qty ELSE 0 END,
				    OutQty		  = CASE WHEN (VTyp.Stock_Type = 2 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 1 )) THEN Det.Qty	ELSE 0 END,

				    InGrossWt	  = CASE WHEN (VTyp.Stock_Type = 1 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 2 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.GrossWt ELSE Det.GrossWt*Um.Base_Qty END)	ELSE 0 END,
				    OutGrossWt	= CASE WHEN (VTyp.Stock_Type = 2 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 1 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.GrossWt ELSE Det.GrossWt*Um.Base_Qty END)	ELSE 0 END,

				    InStoneWt	  = CASE WHEN (VTyp.Stock_Type = 1 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 2 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.StoneWt ELSE Det.StoneWt*Um.Base_Qty END)	ELSE 0 END,
				    OutStoneWt	= CASE WHEN (VTyp.Stock_Type = 2 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 1 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.StoneWt ELSE Det.StoneWt*Um.Base_Qty END)	ELSE 0 END,

				    InWastage	  = CASE WHEN (VTyp.Stock_Type = 1 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 2 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.Wastage ELSE Det.Wastage*Um.Base_Qty END)	ELSE 0 END,
				    OutWastage	= CASE WHEN (VTyp.Stock_Type = 2 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 1 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.Wastage ELSE Det.Wastage*Um.Base_Qty END)	ELSE 0 END,

				    InNettWt	  = CASE WHEN (VTyp.Stock_Type = 1 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 2 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.NettWt ELSE Det.NettWt*Um.Base_Qty   END)		ELSE 0 END,
				    OutNettWt	  = CASE WHEN (VTyp.Stock_Type = 2 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 1 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.NettWt ELSE Det.NettWt*Um.Base_Qty   END)		ELSE 0 END,

            InPureWt	  = CASE WHEN (VTyp.Stock_Type = 1 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 2 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.PureWt ELSE Det.PureWt*Um.Base_Qty   END)		ELSE 0 END,
				    OutPureWt	  = CASE WHEN (VTyp.Stock_Type = 2 AND (Trans.RefSno=0 OR RefVTyp.Stock_Type = 0 OR RefVTyp.Stock_Type= 1 )) THEN (CASE WHEN Um.Base_Qty=0 THEN Det.PureWt ELSE Det.PureWt*Um.Base_Qty   END)		ELSE 0 END
            
	FROM		Transaction_Details Det
				  INNER JOIN Items It ON It.ItemSno=Det.ItemSno
				  INNER JOIN Item_Groups Grp ON Grp.GrpSno = It.GrpSno
				  INNER JOIN Uom Um ON Um.UomSno = Det.UomSno
          LEFT OUTER JOIN Uom Bum ON Bum.UomSno = Um.BaseUomSno
				  LEFT OUTER JOIN Barcoded_Items Bar ON Bar.BarCodeSno = Det.BarCodeSno          
				  INNER JOIN Transactions Trans ON Trans.TransSno = Det.TransSno
          LEFT OUTER JOIN Transactions RefTrans ON RefTrans.TransSno = Trans.RefSno
          LEFT OUTER JOIN Voucher_Types RefVTyp ON RefVTyp.VouTypeSno = RefTrans.VouTypeSno
				  INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Trans.VouTypeSno AND (VTyp.Stock_Type <> 0)
				  INNER JOIN Client Clnt ON Clnt.ClientSno = Trans.ClientSno

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getStockReport') BEGIN DROP FUNCTION Udf_getStockReport END
GO

CREATE FUNCTION Udf_getStockReport(@GrpSno INT, @CompSno INT)
RETURNS Table
  WITH ENCRYPTION AS
RETURN
  
  SELECT	  ItemSno, Item_Name, Karat, Purity, UomSno, Uom_Name,
			      Qty		  = SUM(InQty)		  - SUM(OutQty),
			      GrossWt = SUM(InGrossWt)	- SUM(OutGrossWt),
			      StoneWt	= SUM(InStoneWt)	- SUM(OutStoneWt),
			      Wastage = SUM(InWastage)	- SUM(OutWastage),
			      NettWt	= SUM(InNettWt)		- SUM(OutNettWT),
            PureWt	= SUM(InPureWt)		- SUM(OutPureWT)

  FROM		  VW_STOCK_REGISTER  
  WHERE		  (GrpSno = @GrpSno) AND (CompSno=@CompSno) 
  GROUP BY	ItemSno, Item_Name, Karat, Purity, UomSno, Uom_Name

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_BARCODE_REGISTER') BEGIN DROP VIEW VW_BARCODE_REGISTER END
GO

CREATE VIEW VW_BARCODE_REGISTER
WITH ENCRYPTION AS

  SELECT    Trans.TransSno, VTyp.VouType_Name, Trans.Trans_No, Trans.Trans_Date, Det.DetSno, Det.ItemSno, It.Item_Name, Det.Item_Desc, Bar.BarCodeSno, Bar.BarCode_No, Det.Karat, Det.Purity,
            Det.UomSno, Um.Uom_Name, Um.Base_Qty,
            GrossWt       = CAST(Det.GrossWt / Det.Qty AS DECIMAL(8,3)),
            StoneWt       = CAST(Det.StoneWt / Det.Qty AS DECIMAL(8,3)),
            Wastage       = CAST(Det.Wastage / Det.Qty AS DECIMAL(8,3)),
			      NettWt        = CAST(Det.NettWt / Det.Qty AS DECIMAL(8,3)),
            PureWt        = CAST((Det.NettWt / Det.Qty) *(Det.Purity/100)AS DECIMAL(8,3)),
            Det.Rate, Amount = CAST(Det.Amount / Det.Qty AS DECIMAL(10,2)),

            Issued_Wt     = ( SELECT    ISNULL(SUM(NettWt),0)
                              FROM      Transaction_Details Dt
                                        INNER JOIN Transactions Tr ON Tr.TransSno=Dt.TransSno
                                        INNER JOIN Voucher_Types Vt On Vt.VouTypeSno = Tr.VouTypeSno
                              WHERE     BarCodeSno=Bar.BarCodeSno AND Vt.Stock_Type = 2),

            Balance_Wt    = (Det.NettWt/Det.Qty) - ( SELECT    ISNULL(SUM(NettWt),0)
                              FROM      Transaction_Details Dt
                                        INNER JOIN Transactions Tr ON Tr.TransSno=Dt.TransSno
                                        INNER JOIN Voucher_Types Vt On Vt.VouTypeSno = Tr.VouTypeSno
                              WHERE     BarCodeSno=Bar.BarCodeSno AND Vt.Stock_Type = 2),
            Stock_Status  = CASE WHEN (SELECT ISNULL(SUM(NettWt),0) FROM Transaction_Details WHERE BarCodeSno=Bar.BarCodeSno) <= Det.NettWt THEN 0 ELSE 1 END,
            Trans.CompSno
  FROM      Barcoded_Items Bar
            INNER JOIN Items It ON It.ItemSno = Bar.ItemSno
            INNER JOIN Transaction_Details Det ON Det.DetSno = Bar.DetSno
            INNER JOIN Uom Um ON Um.UomSno = Det.UomSno
			      INNER JOIN Transactions Trans ON Trans.TransSno = Det.TransSno
            INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Trans.VouTypeSno

GO


IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getBarCodeStock') BEGIN DROP FUNCTION Udf_getBarCodeStock END
GO

CREATE FUNCTION Udf_getBarCodeStock(@CompSno INT)
RETURNS Table
  WITH ENCRYPTION AS
RETURN

  SELECT    Bar.*, Bar.BarCode_No as Name, Item_Name as Details
  FROM      VW_BARCODE_REGISTER Bar
  WHERE     (CompSno=@CompSno) --AND Stock_Status=0

GO




IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='VW_ASSAY_RECORDS') BEGIN DROP VIEW VW_ASSAY_RECORDS END
GO
CREATE VIEW VW_ASSAY_RECORDS
WITH ENCRYPTION AS

SELECT    Ar.RecordSno, Ar.BarCodeSno, Bar.BarCode_No, Bar.BarCode_No as Name, It.Item_Name + ' ' + Trans.Trans_No as Details,
          Det.ItemSno, It.Item_Name,Det.Karat, Det.Purity, Det.Item_Desc, Det.Qty, Det.GrossWt, Det.StoneWt, Det.Wastage , Det.NettWt, Det.UomSno, Um.Uom_Name, 

          Trans.Trans_No, Trans.Trans_Date, Trans.ClientSno,
          Clnt.Client_Name, Trans.CompSno, 
          Assay_Status      = CASE
                                WHEN EXISTS (SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26)
                                THEN (CASE WHEN EXISTS (SELECT TransSno FROM Transactions WHERE VouTypeSno=27 AND RefSno=(SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26)) THEN 2 ELSE 1 END) 
                              ELSE 0 END,

          IssueTransSno     = CASE
                                WHEN EXISTS (SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26)
                                THEN (SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26) 
                              ELSE 0 END,

          IssueTrans_No     = CASE
                                WHEN EXISTS (SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26)
                                THEN (SELECT Trans_No FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26) 
                              ELSE '' END,

          ReceiptTransSno   = CASE
                                WHEN EXISTS (SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26)
                                THEN (CASE WHEN EXISTS (SELECT TransSno FROM Transactions WHERE VouTypeSno=27 AND RefSno=(SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26))
                                THEN (SELECT TransSno FROM Transactions WHERE VouTypeSno=27 AND RefSno=(SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26)) ELSE 0 END) 
                              ELSE 0 END,

          ReceiptTrans_No   = CASE
                                WHEN EXISTS (SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26)
                                THEN (CASE WHEN EXISTS (SELECT TransSno FROM Transactions WHERE VouTypeSno=27 AND RefSno=(SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26))
                                THEN (SELECT Trans_No FROM Transactions WHERE VouTypeSno=27 AND RefSno=(SELECT TransSno FROM Transactions WHERE BarCodeRefSno = Ar.RecordSno AND VouTypeSno=26)) ELSE '' END) 
                              ELSE '' END

FROM      Assay_Records Ar
          INNER JOIN Barcoded_Items Bar ON Bar.BarCodeSno = Ar.BarCodeSno
          INNER JOIN Transaction_Details Det ON Det.DetSno  = Bar.DetSno
          INNER JOIN Uom Um ON Um.UomSno = Det.UomSno
          INNER JOIN Items It ON It.ItemSno = Det.ItemSno
          INNER JOIN Transactions Trans ON Trans.TransSno = Det.TransSno
          INNER JOIN Client Clnt ON Clnt.ClientSno = Trans.ClientSno
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_LedgerBook') BEGIN DROP FUNCTION Udf_LedgerBook END
GO

CREATE FUNCTION Udf_LedgerBook(@LedSno INT, @FromDt INT, @ToDt AS INT, @YearFrom INT, @BranchSno AS INT, @CompSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

    SELECT      VouSno, DetSno, VouTypeSno,VouType_Name, Vou_Date,
                vd.Vou_No, vd.Credit, vd.Debit,Led_Name,Narration,
                Particular = CASE When vd.Credit<> 0 Then (SELECT Top 1 Led_Name FROM VW_VOUCHERDETAILS WHERE VouSno = vd.VouSno AND DetSno <> vd.DetSno AND Debit <> 0)
                When vd.Debit <> 0 Then (SELECT Top 1 Led_Name FROM VW_VOUCHERDETAILS WHERE VouSno = vd.VouSno AND DetSno <> vd.DetSno AND Credit <> 0)END

    FROM        VW_VOUCHERDETAILS vd

    WHERE       LedSno = @LedSno AND (Vou_Date BETWEEN @FromDt AND @ToDt) AND (@BranchSno = 0 OR BranchSno= @BranchSno) AND vd.CompSno=@CompSno
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_LedgerBookGroup') BEGIN DROP FUNCTION Udf_LedgerBookGroup END
GO

CREATE FUNCTION Udf_LedgerBookGroup(@LedSno INT, @FromDt INT, @ToDt AS INT, @YearFrom INT, @BranchSno AS INT, @CompSno INT)
  RETURNS TABLE
  WITH ENCRYPTION AS
RETURN

    SELECT      VouSno, DetSno, VouTypeSno,VouType_Name, Vou_Date,
                vd.Vou_No, vd.Credit, vd.Debit,Led_Name,Narration,
                Particular = CASE When vd.Credit <> 0 Then (SELECT Top 1 Led_Name FROM VW_VOUCHERDETAILS WHERE VouSno = vd.VouSno AND DetSno <> vd.DetSno AND Debit <> 0)
                When vd.Debit <> 0 Then  (SELECT Top 1 Led_Name FROM VW_VOUCHERDETAILS WHERE VouSno = vd.VouSno AND DetSno <> vd.DetSno AND Credit <> 0)END

    FROM        VW_VOUCHERDETAILS vd

    WHERE       Led_Desc LIKE (SELECT Grp_Desc +'%' FROM Ledger_Groups WHERE GrpSno =@LedSno)  AND
                (Vou_Date BETWEEN @FromDt AND @ToDt)


GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Sp_Voucher_General' ) BEGIN DROP PROCEDURE Sp_Voucher_General END
GO

CREATE PROCEDURE Sp_Voucher_General
    @VouSno             INT,
    @Vou_No             VARCHAR(20),
    @Vou_Date           INT,
    @VouTypeSno         INT,
    @SeriesSno          INT,
    @LedgerSno          INT,
    @Amount             MONEY,
    @Narration          VARCHAR(100),
    @CompSno            INT,
    @UserSno            INT,
    @PaymentModesXML		XML,
    @ImageDetailXML			XML,    
    @RetSno             INT OUTPUT,
    @RetVou_No			    VARCHAR(20) OUTPUT
WITH ENCRYPTION AS

BEGIN
    SET NOCOUNT ON
    BEGIN TRANSACTION

    DECLARE @Num_Method TINYINT
    SELECT @Num_Method=Num_Method FROM Voucher_Series WHERE SeriesSno=@SeriesSno

    IF (@Num_Method=2)
    BEGIN
        SET @Vou_No= [dbo].GenerateVoucherNo(@SeriesSno)           
    END    

      DECLARE	@IsOpen TINYINT = CASE WHEN @Vou_Date < (SELECT Fin_From FROM Companies WHERE CompSno=@CompSno) THEN 1 ELSE 2 END
      DECLARE  @VouDetailXML XML  = CAST([dbo].GetVoucherXML(@CompSno, @VouTypeSno, @LedgerSno, @IsOpen, @Amount, 1, CAST(@PaymentModesXML AS VARCHAR(MAX))) AS XML)        
      EXEC Sp_AccVouchers @VouSno, @VouTypeSno, @SeriesSno, @Vou_No,  @Vou_Date, '', 0, 0, 0, @UserSno, @CompSno, @VouDetailXML, @VouSno OUTPUT
      
      IF @VouSno = 0 GOTO CloseNow
        
       IF (@Num_Method <> 0)
        BEGIN
          UPDATE Voucher_Series SET Current_No = Current_No + 1 WHERE SeriesSno=@SeriesSno
          IF @@ERROR <> 0 GOTO CloseNow
        END

      IF @PaymentModesXML IS NOT NULL
      BEGIN
			DECLARE @XmlPrefix VARCHAR(20) =  '<ROOT> <Voucher>'
			DECLARE @XmlSuffix VARCHAR(20) =  '</Voucher> </ROOT> '
			SET @PaymentModesXML = @XmlPrefix + CAST(@PaymentModesXML AS VARCHAR(MAX)) + @XmlSuffix
         DECLARE @idoc2       INT
         DECLARE @Sno2        INT 
         DECLARE @LedSno      INT
         DECLARE @Debit       MONEY
         DECLARE @Credit      MONEY
         DECLARE @Trans_Type  TINYINT
         DECLARE @PayRemarks  VARCHAR(50)

         DECLARE @DetTable2 TABLE
             (
             Sno INT IDENTITY(1,1),LedSno INT,Debit MONEY,Credit MONEY, Trans_Type TINYINT, PayRemarks VARCHAR(50)
             )
         Exec sp_xml_preparedocument @idoc2 OUTPUT, @PaymentModesXML
        
         INSERT INTO @DetTable2
             (
              LedSno,Debit,Credit, Trans_Type, PayRemarks
             )
         SELECT  * FROM  OpenXml 
             (
              @idoc2, '/ROOT/Voucher/Voucher_Details',2
             )
         WITH 
            (
              LedSno INT '@LedSno',Debit MONEY '@Debit',Credit MONEY '@Credit', Trans_Type TINYINT '@Trans_Type', PayRemarks VARCHAR(50) '@PayRemarks'
            )
         SELECT      TOP 1 @Sno2=Sno, @LedSno=LedSno, @Debit=Debit, @Credit=Credit, @Trans_Type=Trans_Type, @PayRemarks=PayRemarks
                     FROM @DetTable2
        /*Taking FROM Temporary Details TABLE AND inserting INTO details TABLE here*/
         WHILE @@ROWCOUNT <> 0 
             BEGIN 
                 INSERT INTO PaymentMode_Details(TransSno,Trans_Type,LedSno,Amount,Remarks) 
                 VALUES (@VouSno,@Trans_Type,@LedSno,CASE WHEN @Debit=0 THEN @Credit ELSE @Debit END,@PayRemarks)
                 IF @@Error <> 0 GOTO CloseNow
                 DELETE FROM @DetTable2 WHERE Sno = @Sno2
                 
				 SELECT      TOP 1 @Sno2=Sno,@LedSno=LedSno,@Debit=Debit,@Credit=Credit, @Trans_Type=Trans_Type, @PayRemarks = PayRemarks
                 FROM        @DetTable2
             END
         Exec Sp_Xml_Removedocument @idoc2
      END
    
    SET @RetSno = @VouSno
    SET @RetVou_No = @Vou_No
    COMMIT TRANSACTION
    RETURN @RetSno
CloseNow:
    ROLLBACK TRANSACTION
    RETURN 0
End
GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getVoucher_General') BEGIN DROP FUNCTION Udf_getVoucher_General END
GO

CREATE FUNCTION Udf_getVoucher_General(@VouSno INT,@CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return

    SELECT    Vou.*, VTyp.VouType_Name,
             (SELECT Ser.*, Ser.Series_Name as 'Name', Ser.Series_Name as 'Details', VTyp.VouTypeSno as 'VouType.VouTypeSno', VTyp.VouType_Name as 'VouType.VouType_Name',
                                  VTyp.Cash_Type as 'VouType.Cash_Type', VTyp.Stock_Type as 'VouType.Stock_Type'
                           FROM   Voucher_Series Ser
                                  INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Ser.VouTypeSno
                           WHERE  SeriesSno = Vou.SeriesSno FOR JSON PATH) Series_Json,

               /* PAYMENT MODE JSON ---------------------------------- */
              (SELECT Pm.*, Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details'  FROM PaymentMode_Details Pm INNER JOIN Ledgers Led ON Led.LedSno = Pm.LedSno WHERE TransSno = Vou.VouSno AND Trans_Type=2 FOR JSON PATH) PaymentModes_Json,
              ---------------------------------------------------------------------------------------------------

              /* IMAGES OBJECT (IMAGES JSON)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
              ISNULL((SELECT Img.Image_Name,'' as Image_File, Image_Url='https://www.xauag.au/data/'+Img.Image_Url, '1' as SrcType, 0 as DelStatus FROM Image_Details Img WHERE TransSno = Vou.VouSno AND Image_Grp=3 FOR JSON PATH),'') Images_Json,

              Ledger_Json = (  SELECT      Led.*, Led.Led_Name as 'Name', Led.Led_Name as 'Details'
                          FROM        Ledgers Led
                          WHERE       Led.LedSno = (SELECT  Vd.LedSno
                                                    FROM    Voucher_Details Vd
                                                            INNER JOIN Ledgers dLed ON dLed.LedSno = Vd.LedSno AND (dLed.GrpSno NOT IN (22,23,12,13,14))
                                                    WHERE   VouSno=Vou.VouSno)
                          FOR JSON PATH ),

              Amount  = (SELECT (SUM(Debit)*2) - SUM(Credit) FROM Voucher_Details WHERE VouSno = Vou.VouSno)

    FROM      Vouchers Vou
              INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Vou.VouTypeSno

    WHERE     (VouSno=@VouSno OR @VouSno = 0) AND (Vou.IsAuto =0)  AND (CompSno =@CompSno)

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE name='Udf_getWeeklyConsolidated') BEGIN DROP FUNCTION Udf_getWeeklyConsolidated END
GO

CREATE FUNCTION Udf_getWeeklyConsolidated(@FromDate INT, @ToDate INT, @CompSno INT)
RETURNS Table
WITH ENCRYPTION AS
Return

    SELECT		  [dbo].DateToInt (DATETRUNC(WEEK, [dbo].IntToDate(Trans_Date))) AS WeekStartDate,
			          [dbo].DateToInt (DATEADD(DAY,6,DATETRUNC(WEEK, [dbo].IntToDate(Trans_Date)))) AS WeekEndDate,
			          Trans.VouTypeSno, 
			          COUNT(*) AS Count,
			          SUM(Trans.NettAmount) as NettAmount

    FROM		    Transactions Trans

    WHERE		    (CompSno =@CompSno) AND (Trans_Date BETWEEN @FromDate AND @ToDate)
    GROUP BY	  Trans.VouTypeSno, DATETRUNC(WEEK, [dbo].IntToDate(Trans_Date))
    
GO

IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='Udf_getBarCodeHistory') BEGIN DROP FUNCTION Udf_getBarCodeHistory END
GO
CREATE FUNCTION Udf_getBarCodeHistory(@BarCodeSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

SELECT		Trans.TransSno, VTyp.VouType_Name, Trans.Trans_No, Trans.Trans_Date, Pty.Client_Name,
          Det.ItemSno, It.Item_Name, Det.Item_Desc, Um.Uom_Name, Det.Karat, Det.Purity, Det.GrossWt, Det.NettWt, Det.PureWt, Det.Rate, Det.Amount
          
FROM		  BarCoded_Items Bat
			    INNER JOIN Transaction_Details Det ON Det.DetSno = Bat.DetSno
          INNER JOIN Items It ON It.ItemSno = Det.ItemSno
          INNER JOIN Uom Um ON Um.UomSno = Det.UomSno
			    INNER JOIN Transactions Trans ON Trans.TransSno = Det.TransSno
			    INNER JOIN Client Pty ON Pty.ClientSno = Trans.ClientSno
          INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Trans.VouTypeSno

WHERE		  Bat.BarCodeSno = @BarCodeSno 

UNION ALL	

SELECT		Trans.TransSno, VTyp.VouType_Name, Trans.Trans_No, Trans.Trans_Date, Pty.Client_Name,
          Det.ItemSno, It.Item_Name, Det.Item_Desc, Um.Uom_Name, Det.Karat, Det.Purity, Det.GrossWt, Det.NettWt, Det.PureWt, Det.Rate, Det.Amount
FROM		  Transaction_Details Det
          INNER JOIN Items It ON It.ItemSno = Det.ItemSno
          INNER JOIN Uom Um ON Um.UomSno = Det.UomSno
			    INNER JOIN BarCoded_Items Bat ON Bat.BarCodeSno = Det.BarCodeSno
			    INNER JOIN Transactions Trans ON Trans.TransSno = Det.TransSno
			    INNER JOIN Client Pty ON Pty.ClientSno = Trans.ClientSno
          INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Trans.VouTypeSno
WHERE		  Det.BarCodeSno=@BarCodeSno

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='Udf_getGRINItemswithBarCode') BEGIN DROP FUNCTION Udf_getGRINItemswithBarCode END
GO

CREATE FUNCTION Udf_getGRINItemswithBarCode(@TransSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN

  SELECT          (SELECT     Det.DetSno, Det.TransSno, Det.BarCodeSno, Det.ItemSno, Det.Item_Desc, Det.UomSno, Det.Karat, Det.Purity, Det.Qty, Det.GrossWt, Det.StoneWt, Det.Wastage, Det.NettWt,
                              Det.PureWt, Det.Rate, Det.Amount,
                              It.ItemSno as 'Item.ItemSno', It.Item_Name as 'Item.Item_Name', It.Item_Name as 'Item.Name', 'Code:' + It.Item_Code as 'Item.Details',
                              Um.UomSno as 'Uom.UomSno', Um.Uom_Name as 'Uom.Uom_Name', Um.Uom_Name as 'Uom.Name', 'Code:' + Um.Uom_Code as 'Uom.Details', Um.Base_Qty as 'Uom.Base_Qty',
                              ISNULL(Bar.BarCodeSno,0) as 'BarCode.BarCodeSno', ISNULL(Bar.BarCode_No,'') as 'BarCode.BarCode_No', ISNULL(Bar.BarCode_No,'') as 'BarCode.Name', + ISNULL(Bar.BarCode_No,'') as 'BarCode.Details'

                  FROM        Transaction_Details Det                    
                              INNER JOIN Items It On It.ItemSno=Det.ItemSno
                              INNER JOIN Uom Um ON Um.UomSno = Det.UomSno
                              LEFT OUTER JOIN Barcoded_Items Bar ON Bar.BarCodeSno = Det.BarCodeSno
                              
                  WHERE       Det.TransSno = @TransSno FOR JSON PATH) Items_Json

GO



IF EXISTS(SELECT * FROM SYS.OBJECTS WHERE NAME='Udf_getPendingGrins') BEGIN DROP FUNCTION Udf_getPendingGrins END
GO

CREATE FUNCTION Udf_getPendingGrins(@ClientSno INT, @CompSno INT)
RETURNS TABLE
WITH ENCRYPTION AS
RETURN


SELECT      Trans.*, Trans.Trans_No  as 'Name', 'Date:' + CAST([dbo].IntToDate(Trans.Trans_Date) as VARCHAR)  as 'Details',
                  /* SERIES OBJECT  (SERIES JSON)------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT Ser.*, Ser.Series_Name as 'Name', Ser.Series_Name as 'Details', VTyp.VouTypeSno as 'VouType.VouTypeSno', VTyp.VouType_Name as 'VouType.VouType_Name',
                          VTyp.Cash_Type as 'VouType.Cash_Type', VTyp.Stock_Type as 'VouType.Stock_Type'
                   FROM   Voucher_Series Ser
                          INNER JOIN Voucher_Types VTyp ON VTyp.VouTypeSno = Ser.VouTypeSno
                   WHERE  SeriesSno = Trans.SeriesSno FOR JSON PATH) Series_Json,
                  ----------------------------------------------------------------------------------------------------------------------------------------------------------

                  /* CLIENT OBJECT (CLIENT JSON)------------------------------------------------------------------------*/
                  (SELECT     Clnt.*, Clnt.Client_Name as 'Name', Clnt.Client_Code as 'Details',
                              Profile_Image= CASE WHEN EXISTS(SELECT DetSno FROM Image_Details WHERE TransSno=Clnt.ClientSno AND Image_Grp=1 AND CompSno=@CompSno) THEN 'https://www.xauag.au/data/'+(SELECT TOP 1 Image_Url FROM Image_Details WHERE TransSno=Clnt.ClientSno AND Image_Grp=1 AND CompSno=@CompSno) ELSE '' END
                   FROM       Client Clnt WHERE ClientSno = Trans.ClientSno FOR JSON PATH) Client_Json,

                 ---------------------------------------------------------------------------------------------------
                 /* PAYMENT MODE JSON ---------------------------------- */
                  (SELECT Pm.*, Led.LedSno as 'Ledger.LedSno', Led.Led_Name as 'Ledger.Name', Led.Led_Name as 'Ledger.Details'  FROM PaymentMode_Details Pm INNER JOIN Ledgers Led ON Led.LedSno = Pm.LedSno WHERE TransSno = Trans.TransSno AND Trans_Type=1 FOR JSON PATH) PaymentModes_Json,
                 ---------------------------------------------------------------------------------------------------
                 
                  /* ITEMS OBJECT (ITEMS JSON)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
                  (SELECT     Det.DetSno, Det.TransSno, Det.BarCodeSno, Det.ItemSno, Det.Item_Desc, Det.UomSno, Det.Karat, Det.Purity, Det.Qty, Det.GrossWt, Det.StoneWt, Det.Wastage, Det.NettWt,
                              Det.PureWt, Det.Rate, Det.Amount,
                              It.ItemSno as 'Item.ItemSno', It.Item_Name as 'Item.Item_Name', It.Item_Name as 'Item.Name', 'Code:' + It.Item_Code as 'Item.Details',
                              Um.UomSno as 'Uom.UomSno', Um.Uom_Name as 'Uom.Uom_Name', Um.Uom_Name as 'Uom.Name', 'Code:' + Um.Uom_Code as 'Uom.Details', Um.Base_Qty as 'Uom.Base_Qty',
                              ISNULL(Bar.BarCodeSno,0) as 'BarCode.BarCodeSno', ISNULL(Bar.BarCode_No,'') as 'BarCode.BarCode_No', ISNULL(Bar.BarCode_No,'') as 'BarCode.Name', + ISNULL(Bar.BarCode_No,'') as 'BarCode.Details'

                  FROM        Transaction_Details Det                    
                              INNER JOIN Items It On It.ItemSno=Det.ItemSno
                              INNER JOIN Uom Um ON Um.UomSno = Det.UomSno
                              INNER JOIN Barcoded_Items Bar ON Bar.DetSno = Det.DetSno
                              
                  WHERE       Det.TransSno = Trans.TransSno FOR JSON PATH) Items_Json,
                  ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
             
                  /* IMAGES OBJECT (IMAGES JSON)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
                  ISNULL((SELECT Img.Image_Name,'' as Image_File, Image_Url='https://www.xauag.au/data/'+Img.Image_Url, '1' as SrcType, 0 as DelStatus FROM Image_Details Img WHERE TransSno = Trans.TransSno AND Image_Grp=2 FOR JSON PATH),'') Images_Json,                      
                  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

                  /* PRINT REFERENCE OBJECT( ONLY FOR PRINTING PURPOSE)----------------------------------------------------------------------------------------------------------------------------------------------------------*/
                  ISNULL((SELECT TransSno Trans_No, Trans_Date, Fixed_Price, Commision, TotNettWt, NettAmount FROM VW_TRANSACTIONS WHERE TransSno = Trans.RefSno FOR JSON PATH),'') as PrintReference_Json
                  ----------------------------------------------------------------------------------------------------------------------------------------------------------*/                  

      FROM        VW_TRANSACTIONS Trans                  

      WHERE       (Trans.VouTypeSno=28) AND (Trans.CompSno=@CompSno) AND (Trans.Pending_Status=0)

    GO
