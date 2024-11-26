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
            {   Caption: "Purchase Order", Iconn: "", RouterLink:"loans/2"   },
            {   Caption: "Buying Contract", Iconn: "", RouterLink:"buyingcontracts" },
            {   Caption: "RCTI", Iconn: "", RouterLink:"redemptions"   },            
        ]
    },

    {
        Caption:"Sales",
        Icon:"bx bx-receipt",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Sales Order", Iconn: "", RouterLink:"itemgroups" },
            {   Caption: "Delivery Doc", Iconn: "", RouterLink:"items" },
            {   Caption: "Sales Invoice", Iconn: "", RouterLink:"parties/1" },            
        ]
    },

    {
        Caption:"Production",
        Icon:"bx bxs-factory",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Melting Issue", Iconn: "", RouterLink:"repledges/2"   },
            {   Caption: "Melting Receipt", Iconn: "", RouterLink:"rppayments/2"   },
            {   Caption: "Refining Issue", Iconn: "", RouterLink:"rpclosures"   },                 
            {   Caption: "Refining Receipt", Iconn: "", RouterLink:""},
            {   Caption: "Casting Issue", Iconn: "", RouterLink:"repledges/1"   },
            {   Caption: "Casting Receipt", Iconn: "", RouterLink:"rppayments/1"   },            
            {   Caption: "Jobwork Inward", Iconn: "", RouterLink:"rppayments/1"   },            
            {   Caption: "Jobwork Delivery", Iconn: "", RouterLink:"rppayments/1"   },            
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
            {   Caption: "Voucher", Iconn: "", RouterLink:"customerhistory" },
        ]
    },

    {
        Caption:"Reports",        
        Icon:"bx bxs-report",
        RouterLink: "",
        SubMenu: 
        [
            {   Caption: "Stock Report", Iconn: "", RouterLink:"ledgergroups" },            
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
            {   Caption: "Companies", Iconn: "", RouterLink:"printsetup"   },
        ]
    }
]