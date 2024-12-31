
IF EXISTS(SELECT name FROM SYS.OBJECTS WHERE NAME='GetVoucherXML') BEGIN DROP FUNCTION GetVoucherXML END
GO
--SELECT * FROM VOUCHER_TYPES

--sp_recompile @objname =  N'GetVoucherXML'
--UPDATE STATISTICS Ledgers
--UPDATE STATISTICS party

-- Select CAST([dbo].GetVoucherXML(1,15,50,2,10000,500,100,25000,500,200,1000,4540,4550,'<Voucher_Details LedSno="2" Debit="5000" Credit="0"> </Voucher_Details> ') AS XML)

CREATE FUNCTION [dbo].GetVoucherXML
( 
	@CompSno				    INT,
	@VouTypeSno				  INT,
	@PartySno				    INT,
	@IsOpen					    TINYINT,
	@NettAmount         MONEY,
  @Payment_Type       TINYINT,
	@PayModeXml				  VARCHAR(MAX)
)

RETURNS VARCHAR(MAX)
WITH ENCRYPTION
AS

   BEGIN  
  
	  DECLARE @StdLedgerCashAc			    INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=2)
    DECLARE @StdLedgerProfitandLoss		INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=3)        
    DECLARE @StdLedgerAddLess			    INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=7)
    DECLARE @StdLedgerOtherIncome		  INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=8)
    DECLARE @StdLedgerShortageExcess	INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=9)
    DECLARE @StdLedgerBankCharges		  INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=11)

    DECLARE @StdPurchaseAccount		    INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=12)
    DECLARE @StdSalesAccount		      INT = (SELECT LedSno FROM Ledgers WHERE CompSno=@CompSno AND Std_No=13)

    DECLARE @LedSno INT
    DECLARE @RetXml VARCHAR(MAX)

    SELECT @LedSno = LedSno FROM Client WHERE ClientSno=@PartySno
    
	SET @RetXml = '<ROOT>'
	SET @RetXml = @RetXml + '<Voucher>'
			
			IF @VouTypeSno = 11 -- Buying Contract 
				BEGIN
          IF @Payment_Type = 1
            BEGIN
					    SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Credit="' + CAST(@NettAmount AS VARCHAR)+ '" Debit="0"> </Voucher_Details>'										
              SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@StdPurchaseAccount AS VARCHAR) + '" Debit="' + CAST(@NettAmount AS VARCHAR)+ '" Credit="0"> </Voucher_Details>'
            END
          ELSE
            BEGIN              
              SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@StdPurchaseAccount AS VARCHAR) + '" Debit="' + CAST(@NettAmount AS VARCHAR)+ '" Credit="0"> </Voucher_Details>'
              SET @RetXml = @RetXml + @PayModeXml
            END
				END
        
			ELSE IF @VouTypeSno = 12 -- Rcti 
				BEGIN
          IF @Payment_Type = 1
            BEGIN
					    SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Credit="' + CAST(@NettAmount AS VARCHAR)+ '" Debit="0"> </Voucher_Details>'										
              SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@StdPurchaseAccount AS VARCHAR) + '" Debit="' + CAST(@NettAmount AS VARCHAR)+ '" Credit="0"> </Voucher_Details>'
            END
          ELSE
            BEGIN              
              SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@StdPurchaseAccount AS VARCHAR) + '" Debit="' + CAST(@NettAmount AS VARCHAR)+ '" Credit="0"> </Voucher_Details>'
              SET @RetXml = @RetXml + @PayModeXml
            END
				END

			ELSE IF @VouTypeSno = 15 -- Sales Invoice
			  BEGIN
          IF @Payment_Type = 1
            BEGIN
					    SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Debit="' + CAST(@NettAmount AS VARCHAR)+ '" Credit="0"> </Voucher_Details>'										
              SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@StdSalesAccount AS VARCHAR) + '" Credit="' + CAST(@NettAmount AS VARCHAR)+ '" Debit="0"> </Voucher_Details>'
            END
          ELSE
            BEGIN              
              SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@StdSalesAccount AS VARCHAR) + '" Credit="' + CAST(@NettAmount AS VARCHAR)+ '" Debit="0"> </Voucher_Details>'
              SET @RetXml = @RetXml + @PayModeXml
            END
				END 

      ELSE IF @VouTypeSno = 24 -- Advance Doc Purchase
			  BEGIN
            SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Debit="' + CAST(@NettAmount AS VARCHAR)+ '" Credit="0"> </Voucher_Details>'
            SET @RetXml = @RetXml + @PayModeXml			                
				END

      ELSE IF @VouTypeSno = 25 -- Advance Doc Sales
			  BEGIN
            SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@LedSno AS VARCHAR) + '" Credit="' + CAST(@NettAmount AS VARCHAR)+ '" Debit="0"> </Voucher_Details>'
            SET @RetXml = @RetXml + @PayModeXml
				END

      ELSE IF @VouTypeSno = 2 -- RECEIPT
			  BEGIN
            SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@PartySno AS VARCHAR) + '" Credit="' + CAST(@NettAmount AS VARCHAR)+ '" Debit="0"> </Voucher_Details>'
            SET @RetXml = @RetXml + @PayModeXml
				END 

      ELSE IF @VouTypeSno = 3 -- PAYMENT
			  BEGIN
            SET @RetXml = @RetXml + '<Voucher_Details LedSno="' + CAST(@PartySno AS VARCHAR) + '" Debit="' + CAST(@NettAmount AS VARCHAR)+ '" Credit="0"> </Voucher_Details>'
            SET @RetXml = @RetXml + @PayModeXml
				END

	SET @RetXml = @RetXml + '</Voucher>'
	SET @RetXml = @RetXml + '</ROOT>'

 -- SELECT @RetXml 
 
	RETURN @RetXml
  END

