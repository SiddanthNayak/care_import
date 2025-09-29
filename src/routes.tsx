import TestPage from "@/components/pages/TestPage";

const routes = {
  "/facility/:facilityId/plugtest": ({
    facilityId,
  }: {
    facilityId: string;
  }) => <TestPage facilityId={facilityId} />,
  "/facility/:facilityId/plugtest/dashboard": ({
    facilityId,
  }: {
    facilityId: string;
  }) => <TestPage facilityId={facilityId} />,
};

export default routes;
