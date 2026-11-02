// Roles and permissions: a role list and the permission matrix behind each role.
import * as RAC from "react-aria-components";
import * as Icon from "../icons/icons.jsx";
import { Checkbox, Badge } from "../core/index.jsx";
import { useCrm } from "./i18n.js";

const cx = (...c) => c.filter(Boolean).join(" ");
export const PERMISSION_ACTIONS = ["view", "create", "edit", "delete", "export"];
export const PERMISSION_SCOPES = ["own", "team", "all"];

/* resources: [{ id, label, group, actions?: subset of PERMISSION_ACTIONS, scoped?: boolean }]
   value: { [resourceId]: { actions: string[], scope: "own" | "team" | "all" } }
   onChange(next) gets the whole value. readOnly shows it without controls (built-in roles). */
export function PermissionMatrix({ resources, value, onChange, readOnly = false, actions = PERMISSION_ACTIONS, label }) {
  const { t } = useCrm();
  const groups = [...new Set(resources.map((r) => r.group))];
  const get = (id) => value[id] ?? { actions: [], scope: "own" };
  const set = (id, patch) => onChange?.({ ...value, [id]: { ...get(id), ...patch } });
  const toggle = (r, a, on) => {
    let next = new Set(get(r.id).actions);
    if (on) { next.add(a); if (a !== "view") next.add("view"); } // doing anything needs seeing it
    else { next.delete(a); if (a === "view") next = new Set(); }
    set(r.id, { actions: [...next] });
  };
  return (
    <div className="tv-perm" role="region" aria-label={label ?? t.permissions}>
      <table className="tv-perm-table">
        <thead>
          <tr>
            <th scope="col" className="tv-perm-res">{t.permissions}</th>
            {actions.map((a) => <th key={a} scope="col">{t.actions[a]}</th>)}
            <th scope="col">{t.scope}</th>
          </tr>
        </thead>
        {groups.map((g) => (
          <tbody key={g}>
            <tr className="tv-perm-group"><th colSpan={actions.length + 2} scope="colgroup">{g}</th></tr>
            {resources.filter((r) => r.group === g).map((r) => {
              const v = get(r.id);
              const avail = r.actions ?? actions;
              const all = avail.every((a) => v.actions.includes(a));
              const some = !all && avail.some((a) => v.actions.includes(a));
              return (
                <tr key={r.id} className={cx("tv-perm-row", v.actions.length === 0 && "is-off")}>
                  <th scope="row" className="tv-perm-res">
                    {readOnly ? <span>{r.label}</span> : (
                      <Checkbox isSelected={all} isIndeterminate={some} onChange={(on) => set(r.id, { actions: on ? [...avail] : [] })}
                        aria-label={`${t.allActions}: ${r.label}`}>{r.label}</Checkbox>
                    )}
                    {r.description && <span className="tv-desc tv-perm-desc">{r.description}</span>}
                  </th>
                  {actions.map((a) => (
                    <td key={a} data-label={t.actions[a]}>
                      {!avail.includes(a) ? <span className="tv-perm-na" aria-label="—">—</span>
                        : readOnly ? (v.actions.includes(a) ? <Icon.Check className="tv-perm-yes" role="img" aria-label={`${t.actions[a]}: ✓`} /> : <span className="tv-perm-na" aria-label="—">—</span>)
                        : <Checkbox isSelected={v.actions.includes(a)} onChange={(on) => toggle(r, a, on)} aria-label={`${t.actions[a]} · ${r.label}`} />}
                    </td>
                  ))}
                  <td data-label={t.scope}>
                    {r.scoped === false ? <span className="tv-perm-na">—</span> : readOnly ? <span className="tv-perm-scope-text">{t.scopes[v.scope]}</span> : (
                      <RAC.Select aria-label={`${t.scope} · ${r.label}`} selectedKey={v.scope} onSelectionChange={(k) => set(r.id, { scope: k })}
                        isDisabled={!v.actions.length} className="tv-perm-scope">
                        <RAC.Button className="tv-perm-scope-btn"><RAC.SelectValue /><Icon.ChevronDown /></RAC.Button>
                        <RAC.Popover className="tv-popover" offset={4}>
                          <RAC.ListBox className="tv-listbox">
                            {PERMISSION_SCOPES.map((s) => <RAC.ListBoxItem key={s} id={s} className="tv-item" textValue={t.scopes[s]}>{t.scopes[s]}<Icon.Check className="tv-check-icon" /></RAC.ListBoxItem>)}
                          </RAC.ListBox>
                        </RAC.Popover>
                      </RAC.Select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        ))}
      </table>
    </div>
  );
}

/* roles: [{ id, name, description, members, system, tone }] */
export function RoleList({ roles, selectedId, onSelect, label }) {
  const { t, num } = useCrm();
  return (
    <RAC.GridList aria-label={label ?? t.permissions} items={roles} className="tv-roles" selectionMode="single" disallowEmptySelection
      selectedKeys={selectedId ? [selectedId] : []} onSelectionChange={(k) => { const id = [...k][0]; if (id) onSelect?.(id); }}>
      {(r) => (
        <RAC.GridListItem id={r.id} textValue={r.name} className="tv-role">
          <span className={cx("tv-role-icon", `is-${r.tone ?? "navy"}`)} aria-hidden="true">{r.system ? <Icon.Shield /> : <Icon.Sliders />}</span>
          <span className="tv-role-text">
            <span className="tv-role-name">{r.name}{r.system && <Icon.Lock className="tv-role-lock" aria-label={t.systemRole} />}</span>
            <span className="tv-desc">{r.description}</span>
          </span>
          <Badge tone="neutral">{t.members(r.members, num)}</Badge>
        </RAC.GridListItem>
      )}
    </RAC.GridList>
  );
}
