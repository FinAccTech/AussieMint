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
    BarCodeSno: number;
    BarCode_No: string;
}