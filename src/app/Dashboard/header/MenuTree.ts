
export const menuTree =[
    {
        Caption:"Home",
        Icon:"bx bxs-home",
        RouterLink: "",
        SubMenu: 
        [            
        ]
    },

    {
        Caption:"Purchase",
        Icon:"bx bx-shopping-bag",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Jobwork Inward", Iconn: "", RouterLink:"transactions/22"   },            
            {   Caption: "Jobwork Delivery", Iconn: "", RouterLink:"transactions/23"   },            
            {   Caption: "Purchase Order", Iconn: "", RouterLink:"transactions/24" },
            // {   Caption: "Purchase Order", Iconn: "", RouterLink:"transactions/10" },
            {   Caption: "GRN", Iconn: "", RouterLink:"transactions/28" },
            {   Caption: "Buying Contract", Iconn: "", RouterLink:"transactions/11" },
            {   Caption: "RCTI", Iconn: "", RouterLink:"transactions/12"   },            
        ]
    },

    {
        Caption:"Sales",
        Icon:"bx bx-receipt",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Sales Order", Iconn: "", RouterLink:"transactions/25" },
            // {   Caption: "Sales Order", Iconn: "", RouterLink:"transactions/13" },
            {   Caption: "Delivery Doc", Iconn: "", RouterLink:"transactions/14" },
            {   Caption: "Sales Invoice", Iconn: "", RouterLink:"transactions/15" },            
        ]
    },

    {
        Caption:"Production",
        Icon:"bx bxs-factory",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Melting Issue", Iconn: "", RouterLink:"transactions/16"   },
            {   Caption: "Melting Receipt", Iconn: "", RouterLink:"transactions/17"   },
            {   Caption: "Refining Issue", Iconn: "", RouterLink:"transactions/18"   },                 
            {   Caption: "Refining Receipt", Iconn: "", RouterLink:"transactions/19"},
            {   Caption: "Casting Issue", Iconn: "", RouterLink:"transactions/20"   },
            {   Caption: "Casting Receipt", Iconn: "", RouterLink:"transactions/21"   },                        
            {   Caption: "Lab Testing Issue", Iconn: "", RouterLink:"transactions/26"   }, 
            {   Caption: "Lab Testing Receipt", Iconn: "", RouterLink:"transactions/27"   }, 
        ]
    },

    {
        Caption:"Accounts",
        Icon:"bx bx-book",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Ledger Groups", Iconn: "", RouterLink:"ledgergroups"   },
            {   Caption: "Ledgers", Iconn: "", RouterLink:"ledgers" },
            {   Caption: "Voucher", Iconn: "", RouterLink:"vouchers" },

            {   Caption: "CashBook", Iconn: "", RouterLink:"daybook" },
            {   Caption: "Client Statement", Iconn: "", RouterLink:"ledgerbook" },
        ]
    },

    {
        Caption:"Reports",        
        Icon:"bx bxs-report",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Client History", Iconn: "", RouterLink:"clienthistory" },            
            {   Caption: "Pending Documents", Iconn: "", RouterLink:"pendingdocuments" },            
            {   Caption: "Stock Report", Iconn: "", RouterLink:"stockreport" },            
            {   Caption: "Bar Coded Stock Report", Iconn: "", RouterLink:"barcodedstockreport" },     
            {   Caption: "Lab Reports", Iconn: "", RouterLink:"labreports" },            
            {   Caption: "Weekly Consolidated", Iconn: "", RouterLink:"weeklyconsolidated" },         
            {   Caption: "Bar Coded Item History", Iconn: "", RouterLink:"barcodeditemhistory" },        
        ]
    },

    {
        Caption:"Masters",
        Icon:"bx bx-box",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Item Groups", Iconn: "", RouterLink:"itemgroups"   },
            {   Caption: "Items", Iconn: "", RouterLink:"items"   },
            {   Caption: "Uom", Iconn: "", RouterLink:"uoms"   },            
            {   Caption: "Clients", Iconn: "", RouterLink:"clients"   },            
        ]
    },

    {
        Caption:"Settings",
        Icon:"bx bx-cog",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Voucher Series", Iconn: "", RouterLink:"voucherseries"   },
            {   Caption: "App Setup", Iconn: "", RouterLink:"appsetup"   },
            {   Caption: "Users", Iconn: "", RouterLink:"users"   },
            {   Caption: "Print Setup", Iconn: "", RouterLink:"printsetup"   },
        ]
    }
]