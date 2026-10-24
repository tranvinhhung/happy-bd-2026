"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GachaConfig from "./GachaConfig";
import styles from "../styles/GachaManager.module.scss";

const API_ADMIN = "/api/gacha/admin";
const API_SESSION = "/api/gacha/admin/session";
const API_PROBABILITIES = "/api/gacha/admin/probabilities";

const EMPTY_ITEM = {
    title: "",
    message: "",
    emoji: "💌",
    type_id: "",
    is_active: true,
    probability: 100,
};

async function request(url, options = {}) {
    const response = await fetch(url, {
        credentials: "same-origin",
        cache: "no-store",
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...options.headers,
        },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        throw new Error(data.error || "Có lỗi xảy ra");
    }

    return data;
}

function ModalShell({
    children,
    onClose,
    titleId,
    className = "",
    disabled = false,
}) {
    const dialogRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        previousFocusRef.current = document.activeElement;

        const dialog = dialogRef.current;
        const firstInput = dialog?.querySelector(
            "input:not([disabled]), select:not([disabled]), textarea:not([disabled])",
        );

        (firstInput || dialog)?.focus();

        return () => {
            previousFocusRef.current?.focus?.();
        };
    }, []);

    function handleKeyDown(event) {
        if (event.key === "Escape") {
            event.stopPropagation();

            if (!disabled) onClose();
            return;
        }

        if (event.key !== "Tab") return;

        const elements = [
            ...dialogRef.current.querySelectorAll(
                'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
            ),
        ];

        if (!elements.length) {
            event.preventDefault();
            return;
        }

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    return (
        <div
            className={styles.dialogBackdrop}
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !disabled) {
                    onClose();
                }
            }}
        >
            <div
                ref={dialogRef}
                className={`${styles.dialog} ${className}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
                onKeyDown={handleKeyDown}
            >
                {children}
            </div>
        </div>
    );
}

export default function GachaManager({ open, onClose, onChanged }) {
    const [authenticated, setAuthenticated] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [password, setPassword] = useState("");

    const [tab, setTab] = useState("items");
    const [types, setTypes] = useState([]);
    const [items, setItems] = useState([]);
    const [filterType, setFilterType] = useState("all");
    const [search, setSearch] = useState("");

    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState(null);
    const [itemForm, setItemForm] = useState(EMPTY_ITEM);

    const [typeModalOpen, setTypeModalOpen] = useState(false);
    const [editingTypeId, setEditingTypeId] = useState(null);
    const [typeForm, setTypeForm] = useState({
        name: "",
        is_active: true,
    });

    const [probabilities, setProbabilities] = useState([]);

    const [busy, setBusy] = useState(false);
    const [error, setError] = useState("");
    const [formError, setFormError] = useState("");

    const loadData = useCallback(async () => {
        const data = await request(API_ADMIN);

        const nextTypes = data.types || [];
        const nextItems = data.items || [];

        setTypes(nextTypes);
        setItems(nextItems);

        setProbabilities(
            nextTypes.map((type) => ({
                id: type.id,
                name: type.name,
                probability: Number(type.probability) || 0,
            })),
        );

        setFilterType((current) => {
            if (current !== "all" && !nextTypes.some((type) => type.id === current)) {
                return "all";
            }

            return current;
        });
    }, []);

    useEffect(() => {
        if (!open) return;

        let cancelled = false;

        async function initialize() {
            setCheckingSession(true);
            setError("");

            try {
                const session = await request(API_SESSION);

                if (cancelled) return;

                setAuthenticated(Boolean(session.authenticated));

                if (session.authenticated) {
                    await loadData();
                }
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setCheckingSession(false);
            }
        }

        initialize();

        return () => {
            cancelled = true;
        };
    }, [open, loadData]);

    useEffect(() => {
        if (!open) return;

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [open]);

    if (!open) return null;

    async function run(action, modal = false) {
        setBusy(true);

        if (modal) {
            setFormError("");
        } else {
            setError("");
        }

        try {
            await action();
        } catch (err) {
            if (modal) {
                setFormError(err.message);
            } else {
                setError(err.message);
            }
        } finally {
            setBusy(false);
        }
    }

    async function login(event) {
        event.preventDefault();

        await run(async () => {
            await request(API_SESSION, {
                method: "POST",
                body: JSON.stringify({ password }),
            });

            setPassword("");
            setAuthenticated(true);
            await loadData();
        });
    }

    async function logout() {
        await run(async () => {
            await request(API_SESSION, { method: "DELETE" });

            setAuthenticated(false);
            setItems([]);
            setTypes([]);
            setProbabilities([]);
            setPassword("");
            setTab("items");
        });
    }

    function openAddItem() {
        setEditingItemId(null);
        setItemForm({
            ...EMPTY_ITEM,
            type_id: filterType !== "all" ? filterType : types[0]?.id || "",
        });
        setFormError("");
        setItemModalOpen(true);
    }

    function openEditItem(item) {
        setEditingItemId(item.id);

        setItemForm({
            title: item.title,
            message: item.message,
            emoji: item.emoji || "💌",
            type_id: item.type_id,
            is_active: item.is_active,
            probability: Number(item.probability ?? 100),
        });

        setFormError("");
        setItemModalOpen(true);
    }

    function closeItemModal() {
        if (busy) return;
        setItemModalOpen(false);
        setEditingItemId(null);
        setFormError("");
    }

    async function saveItem(event) {
        event.preventDefault();

        await run(async () => {
            await request(API_ADMIN, {
                method: editingItemId ? "PATCH" : "POST",
                body: JSON.stringify({
                    entity: "item",
                    ...(editingItemId ? { id: editingItemId } : {}),
                    ...itemForm,
                }),
            });

            await loadData();
            onChanged?.();

            setItemModalOpen(false);
            setEditingItemId(null);
            setItemForm(EMPTY_ITEM);
        }, true);
    }

    function openAddType() {
        setEditingTypeId(null);

        setTypeForm({
            name: "",
            is_active: true,
        });

        setFormError("");
        setTypeModalOpen(true);
    }

    function openEditType(type) {
        setEditingTypeId(type.id);

        setTypeForm({
            name: type.name,
            is_active: type.is_active,
        });

        setFormError("");
        setTypeModalOpen(true);
    }

    function closeTypeModal() {
        if (busy) return;

        setTypeModalOpen(false);
        setEditingTypeId(null);
        setFormError("");
    }

    async function saveType(event) {
        event.preventDefault();

        await run(async () => {
            await request(API_ADMIN, {
                method: editingTypeId ? "PATCH" : "POST",
                body: JSON.stringify({
                    entity: "type",
                    ...(editingTypeId ? { id: editingTypeId } : {}),
                    ...typeForm,
                }),
            });

            await loadData();
            onChanged?.();

            setTypeModalOpen(false);
            setEditingTypeId(null);

            setTypeForm({
                name: "",
                is_active: true,
            });
        }, true);
    }

    async function deleteEntity(entity, id, name) {
        const confirmed = window.confirm(
            `Bạn có chắc muốn xóa "${name}" không?\nHành động này không thể hoàn tác.`,
        );

        if (!confirmed) return;

        await run(async () => {
            await request(API_ADMIN, {
                method: "DELETE",
                body: JSON.stringify({ entity, id }),
            });

            await loadData();
            onChanged?.();
        });
    }

    async function saveProbabilities() {
        await run(async () => {
            await request(API_PROBABILITIES, {
                method: "PATCH",
                body: JSON.stringify({
                    probabilities: probabilities.map(({ id, probability }) => ({
                        id,
                        probability,
                    })),
                }),
            });

            await loadData();
            onChanged?.();
        });
    }

    async function toggleTypeActive(type) {
        await run(async () => {
            await request(API_ADMIN, {
                method: "PATCH",
                body: JSON.stringify({
                    entity: "type",
                    id: type.id,
                    name: type.name,
                    is_active: !type.is_active,
                }),
            });

            await loadData();
            onChanged?.();
        });
    }

    const filteredItems = items.filter((item) => {
        const matchesType = filterType === "all" || item.type_id === filterType;

        const keyword = search.trim().toLowerCase();

        const matchesSearch =
            !keyword ||
            item.title.toLowerCase().includes(keyword) ||
            item.message.toLowerCase().includes(keyword);

        return matchesType && matchesSearch;
    });

    const totalProbability = probabilities.reduce(
        (sum, type) => sum + Math.round(type.probability * 100),
        0,
    );

    const probabilityValid =
        probabilities.length > 0 && totalProbability === 10000;

    const isChildModalOpen = itemModalOpen || typeModalOpen;

    return (
        <>
            <ModalShell
                onClose={onClose}
                titleId="gacha-manager-title"
                className={styles.managerDialog}
                disabled={busy || isChildModalOpen}
            >
                <div className={styles.managerHeader}>
                    <div>
                        <span className={styles.eyebrow}>LOVE GACHA · ADMINISTRATION</span>

                        <h2 id="gacha-manager-title">Quản lý hộp quà ♡</h2>

                        <p>Nơi cất giữ những điều bất ngờ dành cho em.</p>
                    </div>

                    <button
                        type="button"
                        className={styles.iconButton}
                        onClick={onClose}
                        disabled={busy || isChildModalOpen}
                        aria-label="Đóng quản lý"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className={styles.error} role="alert">
                        {error}
                    </div>
                )}

                {checkingSession ? (
                    <div className={styles.loading}>Đang kiểm tra quyền truy cập...</div>
                ) : !authenticated ? (
                    <form className={styles.loginForm} onSubmit={login}>
                        <div className={styles.loginIcon}>🔐</div>

                        <h3>Góc bí mật của anh</h3>

                        <p>Nhập mật khẩu quản lý để mở hộp quà nhé.</p>

                        <input
                            type="password"
                            placeholder="Mật khẩu quản lý"
                            autoComplete="current-password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            className={styles.primaryButton}
                            disabled={busy}
                        >
                            {busy ? "Đang kiểm tra..." : "Mở quản lý ♡"}
                        </button>
                    </form>
                ) : (
                    <>
                        <div className={styles.stats}>
                            <div>
                                <strong>{items.length}</strong>
                                <span>Phần thưởng</span>
                            </div>

                            <div>
                                <strong>{types.length}</strong>
                                <span>Loại Gacha</span>
                            </div>

                            <div>
                                <strong>{items.filter((item) => item.is_active).length}</strong>
                                <span>Đang hoạt động</span>
                            </div>
                        </div>

                        <div className={styles.tabs}>
                            <button
                                type="button"
                                className={tab === "items" ? styles.tabActive : ""}
                                onClick={() => setTab("items")}
                            >
                                💌 Gacha
                            </button>

                            <button
                                type="button"
                                className={tab === "types" ? styles.tabActive : ""}
                                onClick={() => setTab("types")}
                            >
                                🗂 Loại Gacha
                            </button>

                            <button
                                type="button"
                                className={tab === "probabilities" ? styles.tabActive : ""}
                                onClick={() => setTab("probabilities")}
                            >
                                🎲 Tỉ lệ quay
                            </button>

                             <button
                                type="button"
                                className={tab === "config" ? styles.tabActive : ""}
                                onClick={() => setTab("config")}
                            >
                                ⚙️ Cấu hình đặc biệt
                            </button>

                            <button
                                type="button"
                                className={styles.logoutButton}
                                onClick={logout}
                                disabled={busy}
                            >
                                Đăng xuất
                            </button>
                        </div>

                        {tab === "items" && (
                            <div className={styles.tabContent}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h3>Danh sách Gacha</h3>
                                        <p>Thêm, sửa và quản lý những món quà.</p>
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={openAddItem}
                                        disabled={busy || types.length === 0}
                                    >
                                        + Thêm Gacha
                                    </button>
                                </div>

                                <div className={styles.filters}>
                                    <select
                                        value={filterType}
                                        onChange={(event) => setFilterType(event.target.value)}
                                        aria-label="Lọc loại Gacha"
                                    >
                                        <option value="all">🎀 Tất cả loại</option>

                                        {types.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.name}
                                            </option>
                                        ))}
                                    </select>

                                    <input
                                        type="search"
                                        placeholder="Tìm tiêu đề, lời nhắn..."
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                    />
                                </div>

                                {types.length === 0 && (
                                    <div className={styles.empty}>
                                        Chưa có loại Gacha. Hãy thêm loại trước nhé!
                                    </div>
                                )}

                                <div className={styles.itemList}>
                                    {filteredItems.map((item) => (
                                        <div className={styles.itemCard} key={item.id}>
                                            <div className={styles.itemEmoji}>
                                                {item.emoji || "💌"}
                                            </div>

                                            <div className={styles.itemInfo}>
                                                <div className={styles.itemMeta}>
                                                    <span>
                                                        {item.gacha_types?.name || "Chưa phân loại"}
                                                    </span>

                                                    <span
                                                        className={
                                                            item.is_active
                                                                ? styles.statusActive
                                                                : styles.statusInactive
                                                        }
                                                    >
                                                        {item.is_active ? "Đang bật" : "Đã tắt"}
                                                    </span>
                                                    <span className={styles.itemTitle}>{item.title}</span>
                                                    <p className={styles.itemProbability}>
                                                        🎲 Trọng số quay: {Number(item.probability ?? 100)}
                                                    </p>
                                                </div>

                                                <div className={styles.itemActions}>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditItem(item)}
                                                    >
                                                        ✎ Sửa
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={styles.deleteButton}
                                                        disabled={busy}
                                                        onClick={() =>
                                                            deleteEntity("item", item.id, item.title)
                                                        }
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {filteredItems.length === 0 && types.length > 0 && (
                                        <div className={styles.empty}>
                                            Không tìm thấy Gacha phù hợp ♡
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {tab === "types" && (
                            <div className={styles.tabContent}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h3>Loại Gacha</h3>
                                        <p>Ví dụ: Ăn sáng, Ăn trưa, Ăn tối, Cà phê...</p>
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        onClick={openAddType}
                                        disabled={busy}
                                    >
                                        + Thêm loại
                                    </button>
                                </div>

                                <div className={styles.typeList}>
                                    {types.map((type) => {
                                        const count = items.filter(
                                            (item) => item.type_id === type.id,
                                        ).length;

                                        return (
                                            <div
                                                key={type.id}
                                                className={`${styles.typeCard} ${!type.is_active ? styles.typeDisabled : ""
                                                    }`}
                                            >
                                                <div>
                                                    <div className={styles.typeTitleRow}>
                                                        <h4>{type.name}</h4>

                                                        <span
                                                            className={
                                                                type.is_active
                                                                    ? styles.statusActive
                                                                    : styles.statusInactive
                                                            }
                                                        >
                                                            {type.is_active ? "● Đang bật" : "○ Đã tắt"}
                                                        </span>
                                                    </div>

                                                    <p>
                                                        {count} phần thưởng
                                                        {" · "}
                                                        {Number(type.probability) || 0}% khi quay ALL
                                                    </p>
                                                </div>

                                                <div className={styles.itemActions}>
                                                    <button
                                                        type="button"
                                                        disabled={busy}
                                                        onClick={() => toggleTypeActive(type)}
                                                    >
                                                        {type.is_active ? "Tắt" : "Bật"}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => openEditType(type)}
                                                    >
                                                        ✎ Sửa
                                                    </button>

                                                    <button
                                                        type="button"
                                                        className={styles.deleteButton}
                                                        disabled={busy || count > 0}
                                                        title={
                                                            count > 0
                                                                ? "Xóa hết phần thưởng thuộc loại này trước"
                                                                : "Xóa loại Gacha"
                                                        }
                                                        onClick={() =>
                                                            deleteEntity("type", type.id, type.name)
                                                        }
                                                    >
                                                        Xóa
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {tab === "probabilities" && (
                            <div className={styles.tabContent}>
                                <div className={styles.sectionHeader}>
                                    <div>
                                        <h3>Tỉ lệ quay Gacha</h3>
                                        <p>
                                            Chỉ áp dụng khi người chơi chọn ALL. Khi chọn loại cụ thể,
                                            máy chỉ quay trong loại đó.
                                        </p>
                                    </div>
                                </div>

                                <div className={styles.probabilityList}>
                                    {probabilities.map((type) => (
                                        <div key={type.id} className={styles.probabilityCard}>
                                            <div className={styles.probabilityTop}>
                                                <strong>{type.name}</strong>

                                                <div className={styles.probabilityInput}>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max="100"
                                                        step="1"
                                                        value={type.probability}
                                                        onChange={(event) => {
                                                            const value = Number(event.target.value);

                                                            setProbabilities((previous) =>
                                                                previous.map((entry) =>
                                                                    entry.id === type.id
                                                                        ? {
                                                                            ...entry,
                                                                            probability: value,
                                                                        }
                                                                        : entry,
                                                                ),
                                                            );
                                                        }}
                                                    />
                                                    <span>%</span>
                                                </div>
                                            </div>

                                            <input
                                                className={styles.range}
                                                type="range"
                                                min="0"
                                                max="100"
                                                step="1"
                                                value={type.probability}
                                                onChange={(event) => {
                                                    const value = Number(event.target.value);

                                                    setProbabilities((previous) =>
                                                        previous.map((entry) =>
                                                            entry.id === type.id
                                                                ? {
                                                                    ...entry,
                                                                    probability: value,
                                                                }
                                                                : entry,
                                                        ),
                                                    );
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.probabilityFooter}>
                                    <div
                                        className={
                                            probabilityValid ? styles.totalValid : styles.totalInvalid
                                        }
                                    >
                                        Tổng tỉ lệ: {(totalProbability / 100).toFixed(0)}% / 100%
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.primaryButton}
                                        disabled={busy || !probabilityValid}
                                        onClick={saveProbabilities}
                                    >
                                        {busy ? "Đang lưu..." : "Lưu tỉ lệ quay ♡"}
                                    </button>
                                </div>

                                <p className={styles.note}>
                                    Lưu ý: Loại có xác suất 0% sẽ không xuất hiện khi quay ALL.
                                    Những loại không có Gacha đang hoạt động cũng sẽ được bỏ qua.
                                </p>
                            </div>
                        )}

                        {tab === "config" && (
                            <GachaConfig
                            />
                        )}
                    </>
                )}
            </ModalShell>

            {itemModalOpen && (
                <ModalShell
                    onClose={closeItemModal}
                    titleId="gacha-item-modal-title"
                    className={styles.editorDialog}
                    disabled={busy}
                >
                    <div className={styles.editorHeader}>
                        <div>
                            <span className={styles.eyebrow}>A LITTLE SURPRISE FOR YOU</span>

                            <h2 id="gacha-item-modal-title">
                                {editingItemId ? "Chỉnh sửa Gacha ♡" : "Thêm Gacha mới ♡"}
                            </h2>
                        </div>

                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={closeItemModal}
                            disabled={busy}
                            aria-label="Đóng popup"
                        >
                            ✕
                        </button>
                    </div>

                    {formError && (
                        <div className={styles.error} role="alert">
                            {formError}
                        </div>
                    )}

                    <form className={styles.editorForm} onSubmit={saveItem}>
                        <div className={styles.field}>
                            <label htmlFor="gacha-item-type">Loại Gacha *</label>

                            <select
                                id="gacha-item-type"
                                value={itemForm.type_id}
                                onChange={(event) =>
                                    setItemForm((previous) => ({
                                        ...previous,
                                        type_id: event.target.value,
                                    }))
                                }
                                required
                            >
                                <option value="">Chọn loại Gacha</option>

                                {types.map((type) => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="gacha-item-title">Tiêu đề *</label>

                            <input
                                id="gacha-item-title"
                                type="text"
                                placeholder="Ví dụ: Một bữa tối lãng mạn"
                                value={itemForm.title}
                                maxLength={120}
                                onChange={(event) =>
                                    setItemForm((previous) => ({
                                        ...previous,
                                        title: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="gacha-item-message">Lời nhắn *</label>

                            <textarea
                                id="gacha-item-message"
                                rows={5}
                                maxLength={1000}
                                placeholder="Viết một lời nhắn dễ thương..."
                                value={itemForm.message}
                                onChange={(event) =>
                                    setItemForm((previous) => ({
                                        ...previous,
                                        message: event.target.value,
                                    }))
                                }
                                required
                            />

                            <small>{itemForm.message.length}/1000 ký tự</small>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="gacha-item-emoji">Emoji</label>

                            <input
                                id="gacha-item-emoji"
                                type="text"
                                maxLength={20}
                                placeholder="💌"
                                value={itemForm.emoji}
                                onChange={(event) =>
                                    setItemForm((previous) => ({
                                        ...previous,
                                        emoji: event.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="gacha-item-probability">
                                Trọng số quay
                            </label>

                            <input
                                id="gacha-item-probability"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                value={itemForm.probability}
                                onChange={(event) =>
                                    setItemForm((previous) => ({
                                        ...previous,
                                        probability:
                                            event.target.value === ""
                                                ? ""
                                                : Number(event.target.value),
                                    }))
                                }
                                required
                            />

                            <small>
                                0 = không thể quay trúng. Trọng số càng cao,
                                cơ hội xuất hiện càng lớn.
                            </small>
                        </div>

                        <label className={styles.activeToggle}>
                            <input
                                type="checkbox"
                                checked={itemForm.is_active}
                                onChange={(event) =>
                                    setItemForm((previous) => ({
                                        ...previous,
                                        is_active: event.target.checked,
                                    }))
                                }
                            />

                            <div>
                                <strong>Đang hoạt động</strong>
                                <span>Bật để Gacha này có thể xuất hiện khi quay.</span>
                            </div>
                        </label>

                        <div className={styles.editorFooter}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={closeItemModal}
                                disabled={busy}
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={
                                    busy ||
                                    !itemForm.type_id ||
                                    !itemForm.title.trim() ||
                                    !itemForm.message.trim()
                                }
                            >
                                {busy
                                    ? "Đang lưu..."
                                    : editingItemId
                                        ? "Lưu thay đổi ♡"
                                        : "Thêm Gacha ♡"}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}

            {typeModalOpen && (
                <ModalShell
                    onClose={closeTypeModal}
                    titleId="gacha-type-modal-title"
                    className={styles.editorDialog}
                    disabled={busy}
                >
                    <div className={styles.editorHeader}>
                        <div>
                            <span className={styles.eyebrow}>LOVE GACHA CATEGORY</span>

                            <h2 id="gacha-type-modal-title">
                                {editingTypeId ? "Chỉnh sửa loại Gacha ♡" : "Thêm loại Gacha ♡"}
                            </h2>
                        </div>

                        <button
                            type="button"
                            className={styles.iconButton}
                            onClick={closeTypeModal}
                            disabled={busy}
                            aria-label="Đóng popup"
                        >
                            ✕
                        </button>
                    </div>

                    {formError && (
                        <div className={styles.error} role="alert">
                            {formError}
                        </div>
                    )}

                    <form className={styles.editorForm} onSubmit={saveType}>
                        <div className={styles.field}>
                            <label htmlFor="gacha-type-name">Tên loại Gacha *</label>

                            <input
                                id="gacha-type-name"
                                type="text"
                                placeholder="Ví dụ: Ăn tối"
                                value={typeForm.name}
                                maxLength={80}
                                onChange={(event) =>
                                    setTypeForm((previous) => ({
                                        ...previous,
                                        name: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>

                        <label className={styles.activeToggle}>
                            <input
                                type="checkbox"
                                checked={typeForm.is_active}
                                onChange={(event) =>
                                    setTypeForm((previous) => ({
                                        ...previous,
                                        is_active: event.target.checked,
                                    }))
                                }
                            />

                            <div>
                                <strong>
                                    {typeForm.is_active ? "Đang hoạt động" : "Đã tắt"}
                                </strong>

                                <span>
                                    {typeForm.is_active
                                        ? "Loại này sẽ xuất hiện trong danh sách chọn Gacha của người chơi."
                                        : "Loại này sẽ bị ẩn khỏi vòng quay, nhưng dữ liệu phần thưởng vẫn được giữ lại."}
                                </span>
                            </div>
                        </label>

                        <div className={styles.editorFooter}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={closeTypeModal}
                                disabled={busy}
                            >
                                Hủy
                            </button>

                            <button
                                type="submit"
                                className={styles.primaryButton}
                                disabled={busy || !typeForm.name.trim()}
                            >
                                {busy
                                    ? "Đang lưu..."
                                    : editingTypeId
                                        ? "Lưu thay đổi ♡"
                                        : "Thêm loại ♡"}
                            </button>
                        </div>
                    </form>
                </ModalShell>
            )}
        </>
    );
}
