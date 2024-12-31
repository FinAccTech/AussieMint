select * from transactions
select * from transaction_Details
SELECT * FROM Barcoded_Items
select * from Assay_Records

select * from paymentmode_Details

select * from VW_ASSAY_RECORDS
select * from voucher_types
select * from VW_BARCODE_REGISTER
select * from Items where item_code='sg'
/*
	truncate table transactions
	truncate table transaction_Details
	truncate table image_Details
	truncate table paymentmode_Details
	truncate table barcoded_items
	truncate table assay_Records
	truncate table vouchers
	truncate table voucher_details
*/

SELECT TOP 10 * FROM 

    ( SELECT	DISTINCT(VouTypeSno)
      FROM	  Transactions )
as sqq

select * from   VW_STOCK_REGISTER
select * from   Voucher_Types
