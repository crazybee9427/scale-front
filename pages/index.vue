<template>
  <div class="min-h-screen bg-gray-100">
    <Sidebar ref="sidebar" />

    <div class="md:ml-64">
      <main class="p-4 md:p-6">
        <div v-if="error || detailsError" class="text-center py-10">
          <p class="text-red-600">
            Failed to load dashboard data. Please try again.
          </p>
        </div>

        <div v-else>
          <div
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <template v-if="shouldShowBasicSkeleton">
              <div
                v-for="i in 4"
                :key="i"
                class="bg-white p-6 rounded-lg shadow-sm animate-pulse"
              >
                <div class="h-4 bg-gray-200 rounded w-3/4" />
                <div class="h-8 bg-gray-200 rounded w-1/2 mt-2" />
                <div class="h-4 bg-gray-200 rounded w-1/4 mt-2" />
              </div>
            </template>
            <template v-else>
              <StatsCard
                title="Total Emails Sent"
                :value="
                  getDetailedStats?.totalStats.emailsSent.toLocaleString() ||
                  '0'
                "
                type="emails"
                :show-trend="false"
                :loading="detailsLoading"
              />
              <StatsCard
                title="Total Leads Contacted"
                :value="
                  getDetailedStats?.totalStats.total_leads_contacted.toLocaleString() ||
                  '0'
                "
                type="default"
                :show-trend="false"
                :loading="detailsLoading"
              />
              <StatsCard
                title="Total Replies"
                :value="
                  getDetailedStats?.totalStats.replies.toLocaleString() || '0'
                "
                :percentage="
                  getDetailedStats?.totalStats.averageReplyRate || '0'
                "
                type="replies"
                :show-trend="false"
                :loading="detailsLoading"
              />
              <StatsCard
                title="Total Interested"
                :value="
                  getDetailedStats?.totalStats.interested.toLocaleString() ||
                  '0'
                "
                type="interested"
                :show-trend="false"
                :loading="detailsLoading"
              />
            </template>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 class="text-xl font-semibold mb-6">Monthly Performance</h2>
            <div>
              <MonthlyChart 
                :workspaces="detailedWorkspaces" 
                :loading="detailsLoading"
              />
            </div>
          </div>

          <div class="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 class="text-xl font-semibold mb-6">Provider Performance</h2>
            <div>
              <template v-if="replyRateLoading">
                <div class="overflow-x-auto">
                  <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                      <tr>
                        <th v-for="i in 5" :key="i" class="px-6 py-3 text-left">
                          <div class="h-4 bg-gray-200 rounded animate-pulse w-24" />
                        </th>
                      </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                      <tr v-for="i in 6" :key="i">
                        <td v-for="j in 5" :key="j" class="px-6 py-4 whitespace-nowrap">
                          <div class="h-4 bg-gray-200 rounded animate-pulse w-20" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
              <template v-else>
                <ProviderStats :data="replyRateStats" :loading="replyRateLoading" />
              </template>
            </div>
          </div>

          <div class="mb-8">
            <h2 class="text-xl font-semibold mb-6">Blacklisted Domains</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <template v-if="detailsLoading">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="bg-white p-6 rounded-lg shadow-sm animate-pulse"
                >
                  <div class="h-6 bg-gray-200 rounded w-3/4 mb-4" />
                  <div class="grid grid-cols-2 gap-4">
                    <div v-for="j in 4" :key="j">
                      <div class="h-4 bg-gray-200 rounded w-2/3 mb-2" />
                      <div class="h-6 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                </div>
              </template>
              <template v-else-if="getDetailedStats">
                <div
                  v-for="workspace in detailedWorkspaces"
                  :key="workspace.workspaceName"
                  class="bg-white rounded-lg shadow-sm p-6"
                >
                  <h3 class="text-lg font-semibold mb-4">
                    {{ workspace.workspaceName }}
                  </h3>
                  <div class="space-y-4">
                    <div v-if="workspace.blackListedDomains?.length">
                      <p class="text-sm text-gray-600 mb-2">Blacklisted Domains</p>
                      <div class="max-h-40 overflow-y-auto">
                        <div class="grid grid-cols-2 gap-2">
                          <div
                            v-for="domain in workspace.blackListedDomains"
                            :key="domain.id"
                            class="text-xs text-gray-500 truncate"
                            :title="domain.domain"
                          >
                            {{ domain.domain }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import Sidebar from "../components/layout/Sidebar.vue";
import StatsCard from "../components/common/StatsCard.vue";
import MonthlyChart from "../components/charts/MonthlyChart.vue";
import ProviderStats from "../components/common/ProviderStats.vue";
import { useDashboard } from "~/composables/useDashboard";

const {
  detailedWorkspaces,
  replyRateStats,
  error,
  detailsError,
  shouldShowBasicSkeleton,
  getDetailedStats,
  fetchDashboardBasic,
  fetchDashboardDetails,
  fetchDashBoardReplyRate,
  detailsLoading,
  replyRateLoading,
} = useDashboard();

onMounted(async () => {
  try {
    await Promise.all([
      fetchDashboardBasic(),
      fetchDashboardDetails(),
      fetchDashBoardReplyRate(),
    ]);
  } catch (err) {
    console.error("Error fetching dashboard data:", err);
  }
});
</script>
