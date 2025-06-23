import { defineComponent, ref, computed, h, watch } from "vue";
import { ElDialog, ElInput, ElButton, ElScrollbar } from "element-plus";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

// 扩充常用 iconify 图标库（Element Plus、RemixIcon、Ant Design、Material Symbols 等）
const ICON_LIST = [
  // Element Plus
  "ep:home-filled",
  "ep:menu",
  "ep:user",
  "ep:setting",
  "ep:edit",
  "ep:delete",
  "ep:search",
  "ep:plus",
  "ep:star",
  "ep:bell",
  "ep:calendar",
  "ep:location",
  "ep:message",
  "ep:lock",
  "ep:unlock",
  "ep:refresh",
  "ep:document",
  "ep:folder",
  "ep:camera",
  "ep:phone",
  "ep:link",
  "ep:upload",
  "ep:download",
  "ep:arrow-down",
  "ep:arrow-up",
  "ep:arrow-left",
  "ep:arrow-right",
  "ep:close",
  "ep:check",
  "ep:warning",
  "ep:info-filled",
  "ep:question-filled",
  "ep:shopping-cart",
  "ep:star-filled",
  "ep:star",
  "ep:filter",
  "ep:sort",
  "ep:cloudy",
  "ep:sunrise",
  "ep:sunset",
  "ep:moon",
  "ep:umbrella",
  "ep:wind-power",
  "ep:lightning",
  "ep:watermelon",
  "ep:apple",
  "ep:pear",
  "ep:orange",
  "ep:grape",
  "ep:cherry",
  "ep:ice-cream",
  "ep:coffee-cup",
  "ep:milk-tea",
  "ep:ice-drink",
  "ep:ice-tea",
  "ep:coin",
  "ep:credit-card",
  "ep:wallet",
  "ep:money",
  "ep:medal",
  "ep:trophy",
  "ep:flag",
  "ep:present",
  "ep:box",
  "ep:shopping-bag",
  "ep:shopping-trolley",
  "ep:shopping-cart-full",
  // RemixIcon
  "ri:dashboard-line",
  "ri:file-list-2-line",
  "ri:settings-3-line",
  "ri:team-line",
  "ri:folder-line",
  "ri:bar-chart-2-line",
  "ri:pie-chart-2-line",
  "ri:mail-line",
  "ri:notification-3-line",
  "ri:logout-box-r-line",
  "ri:home-2-line",
  "ri:menu-2-line",
  "ri:user-3-line",
  "ri:settings-5-line",
  "ri:edit-2-line",
  "ri:delete-bin-2-line",
  "ri:search-2-line",
  "ri:add-line",
  "ri:star-line",
  "ri:star-fill",
  "ri:calendar-2-line",
  "ri:map-pin-line",
  "ri:message-2-line",
  "ri:lock-2-line",
  "ri:refresh-line",
  "ri:download-2-line",
  "ri:upload-2-line",
  "ri:arrow-down-s-line",
  "ri:arrow-up-s-line",
  "ri:arrow-left-s-line",
  "ri:arrow-right-s-line",
  "ri:close-line",
  "ri:check-line",
  "ri:information-line",
  "ri:question-line",
  "ri:shopping-cart-2-line",
  "ri:eye-line",
  "ri:eye-off-line",
  "ri:filter-2-line",
  "ri:sort-desc",
  "ri:cloudy-2-line",
  "ri:sun-line",
  "ri:moon-line",
  "ri:cloud-windy-line",
  "ri:thunderstorms-line",
  "ri:rainy-line",
  "ri:snowy-line",
  "ri:apple-line",
  "ri:beer-line",
  "ri:wallet-3-line",
  "ri:bank-card-line",
  "ri:medal-2-line",
  "ri:trophy-line",
  "ri:flag-2-line",
  "ri:gift-line",
  "ri:box-2-line",
  "ri:shopping-bag-3-line",
  // Ant Design
  "ant-design:appstore-outlined",
  "ant-design:bars-outlined",
  "ant-design:user-outlined",
  "ant-design:setting-outlined",
  "ant-design:edit-outlined",
  "ant-design:delete-outlined",
  "ant-design:search-outlined",
  "ant-design:plus-outlined",
  "ant-design:star-outlined",
  "ant-design:bell-outlined",
  "ant-design:calendar-outlined",
  "ant-design:environment-outlined",
  "ant-design:message-outlined",
  "ant-design:lock-outlined",
  "ant-design:unlock-outlined",
  "ant-design:reload-outlined",
  "ant-design:download-outlined",
  "ant-design:upload-outlined",
  "ant-design:arrow-down-outlined",
  "ant-design:arrow-up-outlined",
  "ant-design:arrow-left-outlined",
  "ant-design:arrow-right-outlined",
  "ant-design:close-outlined",
  "ant-design:check-outlined",
  "ant-design:info-circle-outlined",
  "ant-design:question-circle-outlined",
  "ant-design:shopping-cart-outlined",
  "ant-design:eye-outlined",
  "ant-design:eye-invisible-outlined",
  "ant-design:filter-outlined",
  "ant-design:sort-ascending-outlined",
  "ant-design:cloud-outlined",
  "ant-design:sun-outlined",
  "ant-design:moon-outlined",
  "ant-design:cloud-sync-outlined",
  "ant-design:thunderbolt-outlined",
  "ant-design:apple-outlined",
  "ant-design:coffee-outlined",
  "ant-design:wallet-outlined",
  "ant-design:credit-card-outlined",
  "ant-design:bank-outlined",
  "ant-design:gift-outlined",
  "ant-design:box-plot-outlined",
  "ant-design:shopping-outlined"
  // 可继续扩展 Material Symbols、更多 iconify 图标...
];

const customScrollbarStyle = `
.icon-picker-scrollbar ::-webkit-scrollbar {
  width: 12px;
  background: #f0f0f0;
  border-radius: 8px;
}
.icon-picker-scrollbar ::-webkit-scrollbar-thumb {
  background: #bdbdbd;
  border-radius: 8px;
  min-height: 40px;
}
.icon-picker-scrollbar ::-webkit-scrollbar-thumb:hover {
  background: #888;
}
.icon-picker-scrollbar {
  scrollbar-width: thick;
  scrollbar-color: #bdbdbd #f0f0f0;
}
`;

export default defineComponent({
  name: "IconPicker",
  props: {
    modelValue: String,
    visible: Boolean
  },
  emits: ["update:modelValue", "update:visible"],
  setup(props, { emit }) {
    const search = ref("");
    const dialogVisible = ref(props.visible);
    watch(
      () => props.visible,
      v => (dialogVisible.value = v)
    );
    watch(dialogVisible, v => emit("update:visible", v));

    // 过滤图标
    const filteredIcons = computed(() => {
      if (!search.value) return ICON_LIST;
      return ICON_LIST.filter(icon => icon.includes(search.value));
    });

    // 选择图标
    function selectIcon(icon: string) {
      emit("update:modelValue", icon);
      dialogVisible.value = false;
    }
    // 清除图标
    function clearIcon() {
      emit("update:modelValue", "");
    }

    // 图标区样式：高度固定，始终显示滚动条
    const iconGridStyle = {
      display: "grid",
      gridTemplateColumns: "repeat(8,1fr)",
      gap: "18px",
      padding: "8px 0"
    };

    return () => (
      <>
        <style>{customScrollbarStyle}</style>
        <ElDialog
          modelValue={dialogVisible.value}
          title="选择图标"
          width="600px"
          onClose={() => (dialogVisible.value = false)}
          closeOnClickModal={false}
          destroyOnClose
          alignCenter
        >
          <div style="display:flex;align-items:center;margin-bottom:12px;">
            <ElInput
              v-model={search.value}
              placeholder="搜索图标名"
              clearable
              style="width:300px;margin-right:16px;"
            />
            <ElButton onClick={clearIcon} type="danger" plain size="small">
              清除
            </ElButton>
          </div>
          <ElScrollbar
            class="icon-picker-scrollbar"
            style="height:360px;max-height:360px;min-height:240px;overflow-y:auto;"
          >
            <div style={iconGridStyle}>
              {filteredIcons.value.map(icon => (
                <div
                  key={icon}
                  style={{
                    textAlign: "center",
                    cursor: "pointer",
                    padding: "8px",
                    border:
                      props.modelValue === icon
                        ? "2px solid #409EFF"
                        : "2px solid transparent",
                    borderRadius: "6px",
                    background: props.modelValue === icon ? "#f0f7ff" : ""
                  }}
                  onClick={() => selectIcon(icon)}
                >
                  {h(useRenderIcon(icon, { width: 32, height: 32 }))}
                </div>
              ))}
            </div>
          </ElScrollbar>
        </ElDialog>
      </>
    );
  }
});
