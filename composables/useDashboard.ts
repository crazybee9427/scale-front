import axios from "axios";
import { ref, computed } from "vue";

interface Campaign {
  id: number;
  name: string;
}

interface BasicWorkspaceStats {
  workspaceName: string;
  campaigns: Campaign[];
}

interface DetailedWorkspaceStats {
  workspaceName: string;
  totalScheduled: number;
  totalMaxCapacity: number;
  replyRatePercentage: number;
  monthlyStats: {
    year: number;
    month: number;
    stats: {
      emails_sent: number;
      total_leads_contacted: number;
      opened: number;
      unique_replies: number;
      bounced: number;
      unsubscribed: number;
      interested: number;
    };
  }[];
  blackListedDomains: {
    id: number;
    domain: string;
  }[];
  stats: {
    emailsSent: number;
    total_leads_contacted: number;
    opened: { count: number; percentage: string };
    replies: { count: number; percentage: string };
    bounced: { count: number; percentage: string };
    unsubscribed: { count: number; percentage: string };
    interested: { count: number; percentage: string };
  };
}

export interface ProviderStatsData {
  data: Array<{
    workspaceName: string;
    data: Array<{
      providerCombination: string;
      totalReplies: number;
      totalSent: number;
      replyRate: string;
    }>;
  }>;
}

export function useDashboard() {
  const workspaces = ref<BasicWorkspaceStats[]>([]);
  const detailedWorkspaces = ref<DetailedWorkspaceStats[]>([]);
  const basicLoading = ref(true);
  const detailsLoading = ref(true);
  const error = ref<Error | null>(null);
  const detailsError = ref<Error | null>(null);
  const replyRateStats = ref({ data: [] });
  const replyRateLoading = ref(true);

  const fetchDashboardBasic = async () => {
    try {
      basicLoading.value = true;
      error.value = null;
      const response = await axios.post<{ data: BasicWorkspaceStats[] }>(
        "http://5.9.10.121:8000/api/dashboard/basic"
      );
      workspaces.value = response.data.data || [];
      return response.data;
    } catch (err) {
      error.value = err as Error;
      console.error("Error fetching dashboard basic:", err);
      throw err;
    } finally {
      basicLoading.value = false;
    }
  };

  const fetchDashboardDetails = async () => {
    try {
      detailsLoading.value = true;
      detailsError.value = null;
      const response = await axios.post<{ data: DetailedWorkspaceStats[] }>(
        "http://5.9.10.121:8000/api/dashboard/details"
      );
      detailedWorkspaces.value = response.data.data || [];
      return response.data;
    } catch (err) {
      detailsError.value = err as Error;
      console.error("Error fetching dashboard details:", err);
      throw err;
    } finally {
      detailsLoading.value = false;
    }
  };

  const fetchDashBoardReplyRate = async () => {
    replyRateLoading.value = true;
    try {
      const response = await axios.post(
        "http://5.9.10.121:8000/api/dashboard/reply-rates"
      );
      replyRateStats.value = { data: response.data.data };
      return response.data;
    } catch (err) {
      console.error("Error fetching dashboard reply rates:", err);
      throw err;
    } finally {
      replyRateLoading.value = false;
    }
  };

  const getBasicStats = computed(() => {
    if (!workspaces.value?.length) return null;

    return {
      totalWorkspaces: workspaces.value.length,
      totalCampaigns: workspaces.value.reduce(
        (sum, w) => sum + (w.campaigns?.length || 0),
        0
      ),
      workspaceStats: workspaces.value.map((workspace) => ({
        name: workspace.workspaceName,
        campaignCount: workspace.campaigns?.length || 0,
        campaigns: workspace.campaigns || [],
      })),
    };
  });

  const getDetailedStats = computed(() => {
    if (!detailedWorkspaces.value?.length) return null;

    console.log("detailedWorkspaces", detailedWorkspaces.value);

    const validWorkspaces = detailedWorkspaces.value.filter((w) => w?.stats);
    if (!validWorkspaces.length) return null;

    const totalStats = {
      emailsSent: validWorkspaces.reduce(
        (sum, w) => sum + w.stats.emailsSent,
        0
      ),
      total_leads_contacted: validWorkspaces.reduce(
        (sum, w) => sum + w.stats.total_leads_contacted,
        0
      ),
      replies: validWorkspaces.reduce(
        (sum, w) => sum + w.stats.replies.count,
        0
      ),
      bounced: validWorkspaces.reduce(
        (sum, w) => sum + w.stats.bounced.count,
        0
      ),
      interested: validWorkspaces.reduce(
        (sum, w) => sum + w.stats.interested.count,
        0
      ),
      averageReplyRate: (
        validWorkspaces.reduce(
          (sum, w) => sum + parseFloat(w.stats.replies.percentage),
          0
        ) / validWorkspaces.length
      ).toFixed(2),
    };

    return {
      totalStats,
      workspaceStats: validWorkspaces.map((workspace) => ({
        name: workspace.workspaceName,
        stats: workspace.stats,
        capacity: {
          scheduled: workspace.totalScheduled,
          maxCapacity: workspace.totalMaxCapacity,
          utilization: (
            (workspace.totalScheduled / workspace.totalMaxCapacity) *
            100
          ).toFixed(1),
        },
      })),
    };
  });

  const shouldShowBasicSkeleton = computed(() => {
    return basicLoading.value || !workspaces.value?.length;
  });

  const shouldShowDetailsSkeleton = computed(() => {
    return detailsLoading.value || !detailedWorkspaces.value?.length;
  });

  const shouldShowReplyRateSkeleton = computed(() => {
    return replyRateLoading.value || !replyRateStats.value?.data?.length;
  });

  return {
    workspaces,
    detailedWorkspaces,
    basicLoading,
    detailsLoading,
    error,
    detailsError,
    shouldShowBasicSkeleton,
    shouldShowDetailsSkeleton,
    shouldShowReplyRateSkeleton,
    getBasicStats,
    getDetailedStats,
    fetchDashboardBasic,
    fetchDashboardDetails,
    fetchDashBoardReplyRate,
    replyRateStats,
    replyRateLoading,
  };
}
