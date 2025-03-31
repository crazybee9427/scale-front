<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Workspace
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Provider Combination
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Replies
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total Sent
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Reply Rate (%)
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <template v-for="workspace in data.data" :key="workspace.workspaceName">
          <tr v-for="(combo, index) in workspace.data" :key="index" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap" :class="{ 'border-t': index === 0 }">
              <span v-if="index === 0">{{ workspace.workspaceName }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ combo.providerCombination }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ combo.totalReplies }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ combo.totalSent.toLocaleString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ combo.replyRate }}%
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface ProviderCombination {
  providerCombination: string;
  totalReplies: number;
  totalSent: number;
  replyRate: string;
}

interface WorkspaceData {
  workspaceName: string;
  data: ProviderCombination[];
}

interface ProviderStatsData {
  data: WorkspaceData[];
}

defineProps<{
  data: ProviderStatsData;
  loading: boolean;
}>();
</script> 