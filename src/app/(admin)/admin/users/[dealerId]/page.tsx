
import { notFound } from "next/navigation";
import { ViewDealerProfile } from "@/components/admin/view-dealer-profile";
import { 
    fetchDealerById, 
    getDealerDashboardData, 
    getDealerVehicles, 
    getDealerEmployees, 
    getDealerLeads 
} from "../../../actions";

export default async function DealerProfilePage({ params }: { params: { dealerId: string } }) {
  const { dealerId } = params;
  
  if (dealerId === 'admin-user') {
      notFound();
  }
  
  const [dealer, dashboardData, vehicles, employees, leads] = await Promise.all([
    fetchDealerById(dealerId),
    getDealerDashboardData(dealerId),
    getDealerVehicles(dealerId),
    getDealerEmployees(dealerId),
    getDealerLeads(dealerId),
  ]);


  if (!dealer) {
    notFound();
  }

  return (
    <ViewDealerProfile 
        dealer={dealer} 
        dashboardData={dashboardData}
        vehicles={vehicles}
        employees={employees}
        leads={leads}
    />
  );
}
