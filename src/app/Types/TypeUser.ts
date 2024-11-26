import { FileHandle } from "./file-handle";
import { TypeCompanies } from "./TypeCompanies";

export interface TypeUser {
    UserSno: number;    
    UserName?: string;        
    Password?: string, 
    User_Type?: number;
    Active_Status?: number;    
    Rights_Json?: string;
    Rights_List?: TypeUserRights[];
    UserRightsXml?: string;
    Comp_Rights_Json?: string;
    Comp_Rights_List?: TypeCompRights[],
    CompRightsXml?: string;          
    Profile_Image: string;
    Image_Name: string;
    fileSource?: FileHandle;    
    Enable_WorkingHours: number;
    FromTime: string;
    ToTime: string
  }
  
  export interface TypeCompRights extends TypeCompanies{    
    Comp_Right: boolean;
  }
  
  export interface TypeUserRights{     
    FormSno: number;
    Form_Name: string;
    View_Right: boolean;
    Edit_Right: boolean;
    Print_Right: boolean;
    Delete_Right: boolean;
    Create_Right: boolean;
    Report_Right: boolean;
    Date_Access: boolean;
    Search_Access: boolean;
  }
  
  