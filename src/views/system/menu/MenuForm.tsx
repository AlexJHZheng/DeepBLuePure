import { defineComponent, h, ref, watch } from "vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import IconPicker from "@/components/IconPicker";

/**
 * 菜单表单组件，供弹窗复用
 */
export default defineComponent({
  props: {
    formInline: { type: Object, default: () => ({}) }
  },
  setup(props) {
    // 图标选择弹窗控制
    const iconDialog = ref(false);
    // 监听外部 icon 变化
    watch(
      () => props.formInline.icon,
      v => {
        if (!v) iconDialog.value = false;
      }
    );
    return () => (
      <el-form model={props.formInline} label-width="90px">
        <el-form-item label="菜单名称" prop="title">
          <el-input
            v-model={props.formInline.title}
            placeholder="请输入菜单名称"
          />
        </el-form-item>
        <el-form-item label="路由名称" prop="name">
          <el-input
            v-model={props.formInline.name}
            placeholder="请输入路由名称"
          />
        </el-form-item>
        <el-form-item label="路由路径" prop="path">
          <el-input
            v-model={props.formInline.path}
            placeholder="请输入路由路径"
          />
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input
            v-model={props.formInline.component}
            placeholder="请输入组件路径"
          />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-button
            type="primary"
            plain
            onClick={() => (iconDialog.value = true)}
          >
            选择图标
          </el-button>
          {props.formInline.icon && (
            <span style="margin-left:12px;display:inline-flex;align-items:center;">
              {h(
                useRenderIcon(props.formInline.icon, { width: 24, height: 24 })
              )}
              <span style="margin-left:6px;font-size:12px;color:#888;">
                {props.formInline.icon}
              </span>
              <el-button
                size="small"
                type="danger"
                text
                style="margin-left:4px;"
                onClick={() => (props.formInline.icon = "")}
              >
                清除
              </el-button>
            </span>
          )}
          <IconPicker
            v-model={props.formInline.icon}
            v-model:visible={iconDialog.value}
          />
        </el-form-item>
        <el-form-item label="排序" prop="order_num">
          <el-input-number v-model={props.formInline.order_num} min={0} />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model={props.formInline.status}>
            <el-radio label={1}>正常</el-radio>
            <el-radio label={0}>禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="父菜单ID" prop="parent_id">
          <el-input-number v-model={props.formInline.parent_id} min={0} />
        </el-form-item>
      </el-form>
    );
  }
});
