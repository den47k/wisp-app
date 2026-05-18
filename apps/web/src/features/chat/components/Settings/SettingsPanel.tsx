import { useState } from "react";
import { Avatar, Icon, Toggle } from "@chat/ui";
import { AVATAR_GRADIENTS } from "@chat/ui";
import { useThemeStore } from "@/stores/theme";
import { useAuthStore } from "@/stores/auth";

type Tab = "profile" | "appearance" | "notifications" | "privacy";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: "profile", label: "Profile", icon: <Icon name="user" size={14} /> },
  { id: "appearance", label: "Appearance", icon: <Icon name="sparkle" size={14} /> },
  { id: "notifications", label: "Notifications", icon: <Icon name="bell" size={14} /> },
  { id: "privacy", label: "Privacy", icon: <Icon name="lock" size={14} /> },
];

export const SettingsPanel = ({ open, onClose }: SettingsPanelProps) => {
  const [tab, setTab] = useState<Tab>("profile");
  const { theme, setTheme } = useThemeStore();
  const user = useAuthStore((s) => s.user);

  if (!open) return null;

  return (
    <div className="wh-settings-overlay" onClick={onClose}>
      <div className="wh-settings" onClick={(e) => e.stopPropagation()}>
        <aside className="wh-settings-nav">
          <div className="wh-settings-ttl">Settings</div>
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`wh-settings-tab${tab === t.id ? " is-on" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
          <button type="button" className="wh-settings-tab wh-settings-close" onClick={onClose}>
            <Icon name="x" size={14} />
            <span>Close</span>
          </button>
        </aside>

        <div className="wh-settings-body">
          {tab === "profile" && (
            <div>
              <h3 className="wh-settings-h">Profile</h3>
              <div className="wh-settings-row wh-settings-row--avatar">
                <Avatar gradientIdx={0} size={72} name={user?.name ?? "You"} />
                <div className="wh-avatar-picker">
                  {AVATAR_GRADIENTS.map((g, i) => (
                    <button
                      key={i}
                      type="button"
                      className={`wh-avatar-swatch${i === 0 ? " is-on" : ""}`}
                      style={{ background: `linear-gradient(135deg, ${g[0]}, ${g[1]})` }}
                    />
                  ))}
                </div>
              </div>
              <div className="wh-fields">
                <div className="wh-field">
                  <label className="wh-label">Display name</label>
                  <div className="wh-input-wrap">
                    <Icon name="user" size={16} />
                    <input defaultValue={user?.name ?? ""} />
                  </div>
                </div>
                <div className="wh-field">
                  <label className="wh-label">Username</label>
                  <div className="wh-input-wrap">
                    <span className="wh-input-prefix">@</span>
                    <input defaultValue={user?.tag ?? ""} />
                  </div>
                </div>
                <div className="wh-field">
                  <label className="wh-label">Status</label>
                  <div className="wh-input-wrap">
                    <input placeholder="What are you up to?" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {tab === "appearance" && (
            <div>
              <h3 className="wh-settings-h">Appearance</h3>
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">Theme</div>
                  <div className="wh-settings-desc">Choose how Wisp looks to you.</div>
                </div>
                <div className="wh-theme-switch">
                  <button
                    type="button"
                    className={theme === "light" ? "is-on" : ""}
                    onClick={() => setTheme("light")}
                  >
                    <Icon name="sun" size={14} /> Light
                  </button>
                  <button
                    type="button"
                    className={theme === "dark" ? "is-on" : ""}
                    onClick={() => setTheme("dark")}
                  >
                    <Icon name="moon" size={14} /> Dark
                  </button>
                </div>
              </div>
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">Reduce motion</div>
                  <div className="wh-settings-desc">Minimize animations and gradients.</div>
                </div>
                <Toggle on={false} onChange={() => {}} />
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div>
              <h3 className="wh-settings-h">Notifications</h3>
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">Sound</div>
                  <div className="wh-settings-desc">Play a soft chime for new messages.</div>
                </div>
                <Toggle on={true} onChange={() => {}} />
              </div>
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">Desktop alerts</div>
                  <div className="wh-settings-desc">
                    Show banners when the app is in the background.
                  </div>
                </div>
                <Toggle on={true} onChange={() => {}} />
              </div>
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">Quiet hours</div>
                  <div className="wh-settings-desc">10:00 PM — 8:00 AM</div>
                </div>
                <Toggle on={false} onChange={() => {}} />
              </div>
            </div>
          )}

          {tab === "privacy" && (
            <div>
              <h3 className="wh-settings-h">Privacy</h3>
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">Read receipts</div>
                  <div className="wh-settings-desc">Let friends know when you've read.</div>
                </div>
                <Toggle on={true} onChange={() => {}} />
              </div>
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">Who can message me</div>
                  <div className="wh-settings-desc">Anyone you've accepted.</div>
                </div>
                <span className="wh-settings-val">Contacts only</span>
              </div>
              <div className="wh-settings-row">
                <div>
                  <div className="wh-settings-lbl">End-to-end encryption</div>
                  <div className="wh-settings-desc">Active on all conversations.</div>
                </div>
                <span className="wh-badge-ok">Active</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
