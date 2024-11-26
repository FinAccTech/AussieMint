export interface TypeAppSetup{
    SetupSno: number;
    CompSno: number;
    AreaCode_AutoGen: number;
    AreaCode_Prefix: string;
    AreaCode_CurrentNo: number;  

    ClientCode_AutoGen: number;   
    ClientCode_Prefix: string;    
    ClientCode_CurrentNo: number;  

    GrpCode_AutoGen: number;     
    GrpCode_Prefix: string;      
    GrpCode_CurrentNo: number;   

    ItemCode_AutoGen: number;    
    ItemCode_Prefix: string;     
    ItemCode_CurrentNo: number;  
  
    UomCode_AutoGen: number;    
    UomCode_Prefix: string;     
    UomCode_CurrentNo: number;  

    Images_Mandatory: number;    
  
    Allow_DuplicateItems: number;  
    Disable_AddLess: number;       
    Entries_LockedUpto: number;    
    Enable_Authentication: number; 
    Enable_OldEntries: number;     
    MobileNumberMandatory: number; 
}