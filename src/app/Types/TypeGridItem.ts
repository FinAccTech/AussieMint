import { TypeItem } from "../Dashboard/Services/item.service";
import { TypeUom } from "../Dashboard/Services/uom.service";

export interface TypeGridItem{
    BarCode:    TypeBarCode;    
    DetSno:     number;
    Item:       TypeItem;    
    Item_Desc:  string;
    Karat:      number;
    Purity:     number;    
    Qty:        number;
    GrossWt:    number;
    StoneWt:    number;
    Wastage:    number;
    NettWt:     number;
    Uom:        TypeUom;
    Rate:       number;
    Amount:     number;    
}

export interface TypeBarCode{
    BarCodeSno      : number;
    BarCode_No      : string;
    TransSno?       : number;
    VouType_Name?   : string;
    Trans_No?       : string;
    Trans_Date?     : number;
    DetSno?         : number;
    ItemSno?        : number;
    Item_Name?      : string;
    UomSno?         : number;
    Uom_Name?       : string;
    Karat?          : number;
    Purity?         : number;
    GrossWt?        : number;
    StoneWt?        : number;
    Wastage?        : number;
    NettWt?         : number;
    Rate?           : number;
    Amount?         : number;
    Issued_Wt?      : number;
    Balance_Wt?     : number;
    Stock_Status?   : number;
    CompSno?        : number;
    Name?            : string;
    Details?         : string;
}