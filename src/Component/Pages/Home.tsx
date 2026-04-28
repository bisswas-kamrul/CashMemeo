import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Trash2, Plus, Printer, Save, FileText, Upload, X } from "lucide-react";
import { toast } from "sonner";

type Item = { id: string; name: string; qty: number; price: number };
type Measurement = {
  body: string;
  hata: string;
  long: string;
  pajama: string;
  extra: string;
};

type Memo = {
  id: string;
  sn: string;
  name: string;
  phone: string;
  deliveryDate: string;
  createdAt: string;
  measurement: Measurement;
  items: Item[];
  advance: number;
  note: string;
};

const blankMeasurement: Measurement = {
  body: "",
  hata: "",
  long: "",
  pajama: "",
  extra: "",
};

const emptyMemo = (): Memo => ({
  id: crypto.randomUUID(),
  sn: "", // String(Date.now()).slice(0),/string er poreborte
  name: "",
  phone: "",
  deliveryDate: "",
  createdAt: new Date().toISOString(),
  measurement: { ...blankMeasurement },
  items: [{ id: crypto.randomUUID(), name: "পাঞ্জাবি", qty: 1, price: 0 }],
  advance: 0,
  note: "",
});

const STORAGE_KEY = "tailor-memos-v1";
const SHOP_KEY = "tailor-shop-v1";

const Home = () => {
  const [memo, setMemo] = useState<Memo>(emptyMemo());
  const [saved, setSaved] = useState<Memo[]>([]);
  const [shopName, setShopName] = useState("দর্জি ঘর");
  const [shopInfo, setShopInfo] = useState("মোবাইল: ০১XXXXXXXXX");
  const [logo, setLogo] = useState<string>("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setSaved(JSON.parse(raw));
      const shop = localStorage.getItem(SHOP_KEY);
      if (shop) {
        const s = JSON.parse(shop);
        setShopName(s.name ?? "দর্জি ঘর");
        setShopInfo(s.info ?? "");
        setLogo(s.logo ?? "");
      }
    } catch {}
  }, []);

  const total = useMemo(
    () => memo.items.reduce((s, i) => s + (i.qty || 0) * (i.price || 0), 0),
    [memo.items],
  );
  const due = Math.max(0, total - (memo.advance || 0));

  const updateItem = (id: string, patch: Partial<Item>) =>
    setMemo((m) => ({
      ...m,
      items: m.items.map((i) => (i.id === id ? { ...i, ...patch } : i)),
    }));

  const addItem = () =>
    setMemo((m) => ({
      ...m,
      items: [
        ...m.items,
        { id: crypto.randomUUID(), name: "", qty: 1, price: 0 },
      ],
    }));

  const removeItem = (id: string) =>
    setMemo((m) => ({ ...m, items: m.items.filter((i) => i.id !== id) }));

  const saveMemo = () => {
    if (!memo.name.trim()) {
      toast.error("কাস্টমারের নাম দিন");
      return;
    }
    const exists = saved.find((s) => s.id === memo.id);
    const next = exists
      ? saved.map((s) => (s.id === memo.id ? memo : s))
      : [memo, ...saved];
    setSaved(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    localStorage.setItem(
      SHOP_KEY,
      JSON.stringify({ name: shopName, info: shopInfo, logo }),
    );
    toast.success("মেমো সেভ হয়েছে");
  };

  const newMemo = () => setMemo(emptyMemo());

  const loadMemo = (m: Memo) => {
    setMemo(m);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteSaved = (id: string) => {
    const next = saved.filter((s) => s.id !== id);
    setSaved(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    toast.success("ডিলিট হয়েছে");
  };

  const print = () => window.print();

  const onLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1.9 * 1024 * 1024) {
      toast.error("ছবি খুব বড় (সর্বোচ্চ ১.৫MB)");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setLogo(dataUrl);
      try {
        const raw = localStorage.getItem(SHOP_KEY);
        const s = raw ? JSON.parse(raw) : {};
        localStorage.setItem(
          SHOP_KEY,
          JSON.stringify({
            ...s,
            name: shopName,
            info: shopInfo,
            logo: dataUrl,
          }),
        );
      } catch {}
      toast.success("লোগো আপডেট হয়েছে");
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removeLogo = () => {
    setLogo("");
    try {
      const raw = localStorage.getItem(SHOP_KEY);
      const s = raw ? JSON.parse(raw) : {};
      localStorage.setItem(SHOP_KEY, JSON.stringify({ ...s, logo: "" }));
    } catch {}
  };

  return (
    <>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="no-print border-b bg-card">
          <div className="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-red-500 flex items-center justify-center">
                <FileText className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="font-display text-xl font-bold">
                  Tailor Cash Memo
                </h1>
                <p className="text-xs text-muted-foreground">
                  দর্জির মাপ ও হিসাব
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={newMemo}>
                নতুন মেমো
              </Button>
              <Button variant="outline" onClick={saveMemo}>
                <Save className="h-4 w-4 mr-1" />
                সেভ
              </Button>
              <Button onClick={print} className="bg-teal-500">
                <Printer className="h-4 w-4 mr-1" />
                প্রিন্ট
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-6 grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Memo sheet */}
          <div className="print-area">
            <Card className="overflow-hidden shadow-white">
              {/* Shop header */}
              <div className="bg-red-500 text-primary-foreground px-6 py-5 flex items-center gap-4">
                <div className="relative shrink-0 group">
                  {logo ? (
                    <img
                      src={logo}
                      alt="দোকান লোগো"
                      className="h-16 w-16 rounded-full object-cover border-2 border-primary-foreground/40 bg-white"
                    />
                  ) : (
                    <label className="h-16 w-16 rounded-full border-2 border-dashed border-primary-foreground/50 flex flex-col items-center justify-center cursor-pointer hover:bg-primary-foreground/10 transition no-print">
                      <Upload className="h-4 w-4" />
                      <span className="text-[9px] mt-0.5">লোগো</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onLogoUpload}
                      />
                    </label>
                  )}
                  {logo && (
                    <div className="no-print absolute -top-1 -right-1 flex gap-1">
                      <label
                        className="h-6 w-6 rounded-full bg-primary-foreground text-primary flex items-center justify-center cursor-pointer shadow"
                        title="পরিবর্তন">
                        <Upload className="h-3 w-3" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={onLogoUpload}
                        />
                      </label>
                      <button
                        onClick={removeLogo}
                        className="h-6 w-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow"
                        title="মুছুন">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center">
                  <input
                    className="w-full bg-transparent text-center font-display text-2xl font-bold outline-none placeholder:text-primary-foreground/60"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    placeholder="দোকানের নাম"
                  />
                  <input
                    className="w-full bg-transparent text-center text-sm outline-none mt-1 placeholder:text-primary-foreground/60"
                    value={shopInfo}
                    onChange={(e) => setShopInfo(e.target.value)}
                    placeholder="ঠিকানা / মোবাইল"
                  />
                  <div className="mt-2 inline-block border-t border-primary-foreground/40 pt-1 tracking-widest text-xs uppercase">
                    Cash Memo
                  </div>
                </div>
                <div className="h-16 w-16 shrink-0" aria-hidden />
              </div>

              {/* Top info */}
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4 border-b">
                <Field
                  label="S/N"
                  value={memo.sn}
                  onChange={(v) => setMemo({ ...memo, sn: v })}
                />
                <Field
                  label="তারিখ"
                  value={new Date(memo.createdAt).toLocaleDateString("bn-BD")}
                  readOnly
                />
                <Field
                  label="Delivery Date"
                  type="date"
                  value={memo.deliveryDate}
                  onChange={(v) => setMemo({ ...memo, deliveryDate: v })}
                />
                <Field
                  label="মোবাইল"
                  value={memo.phone}
                  onChange={(v) => setMemo({ ...memo, phone: v })}
                />
                <div className="col-span-2 md:col-span-4">
                  <Field
                    label="নাম"
                    value={memo.name}
                    onChange={(v) => setMemo({ ...memo, name: v })}
                  />
                </div>
              </div>

              {/* Measurements */}
              <div className="p-6 border-b">
                <h3 className="font-bangla text-base font-semibold mb-3 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  মাপ (ইঞ্চি)
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  <MField
                    label="বডি"
                    value={memo.measurement.body}
                    onChange={(v) =>
                      setMemo({
                        ...memo,
                        measurement: { ...memo.measurement, body: v },
                      })
                    }
                  />
                  <MField
                    label="হাতা লং"
                    value={memo.measurement.hata}
                    onChange={(v) =>
                      setMemo({
                        ...memo,
                        measurement: { ...memo.measurement, hata: v },
                      })
                    }
                  />
                  <MField
                    label="লং"
                    value={memo.measurement.long}
                    onChange={(v) =>
                      setMemo({
                        ...memo,
                        measurement: { ...memo.measurement, long: v },
                      })
                    }
                  />
                  <MField
                    label="পাজামা লং"
                    value={memo.measurement.pajama}
                    onChange={(v) =>
                      setMemo({
                        ...memo,
                        measurement: { ...memo.measurement, pajama: v },
                      })
                    }
                  />
                  <MField
                    label="অন্যান্য"
                    value={memo.measurement.extra}
                    onChange={(v) =>
                      setMemo({
                        ...memo,
                        measurement: { ...memo.measurement, extra: v },
                      })
                    }
                  />
                </div>
              </div>

              {/* Items */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bangla text-base font-semibold flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    আইটেম
                  </h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={addItem}
                    className="no-print">
                    <Plus className="h-4 w-4 mr-1" />
                    যোগ
                  </Button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="py-2 pr-2">বিবরণ</th>
                        <th className="py-2 px-2 w-20 text-center">পরিমাণ</th>
                        <th className="py-2 px-2 w-28 text-right">দাম (৳)</th>
                        <th className="py-2 pl-2 w-28 text-right">মোট (৳)</th>
                        <th className="no-print w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {memo.items.map((it) => (
                        <tr key={it.id} className="border-b last:border-0">
                          <td className="py-2 pr-2">
                            <input
                              className="w-full bg-transparent outline-none py-1"
                              value={it.name}
                              onChange={(e) =>
                                updateItem(it.id, { name: e.target.value })
                              }
                              placeholder="পাঞ্জাবি / পাজামা..."
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              className="w-full bg-transparent outline-none text-center py-1"
                              value={it.qty}
                              onChange={(e) =>
                                updateItem(it.id, {
                                  qty: Number(e.target.value),
                                })
                              }
                            />
                          </td>
                          <td className="py-2 px-2">
                            <input
                              type="number"
                              className="w-full bg-transparent outline-none text-right py-1"
                              value={it.price || ""}
                              onChange={(e) =>
                                updateItem(it.id, {
                                  price: Number(e.target.value),
                                })
                              }
                            />
                          </td>
                          <td className="py-2 pl-2 text-right font-medium">
                            {((it.qty || 0) * (it.price || 0)).toLocaleString(
                              "bn-BD",
                            )}
                          </td>
                          <td className="no-print">
                            <button
                              onClick={() => removeItem(it.id)}
                              className="text-muted-foreground hover:text-destructive p-1">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="p-6 grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground">নোট</Label>
                  <textarea
                    className="mt-1 w-full min-h-20 rounded-md border bg-background p-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                    value={memo.note}
                    onChange={(e) => setMemo({ ...memo, note: e.target.value })}
                    placeholder="বিশেষ নির্দেশনা..."
                  />
                </div>
                <div className="space-y-2 text-sm">
                  <Row
                    label="মোট"
                    value={`৳ ${total.toLocaleString("bn-BD")}`}
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">অগ্রিম</span>
                    <input
                      type="number"
                      className="w-32 text-right bg-transparent border-b outline-none py-1"
                      value={memo.advance || ""}
                      onChange={(e) =>
                        setMemo({ ...memo, advance: Number(e.target.value) })
                      }
                    />
                  </div>
                  <div className="h-px bg-border" />
                  <Row
                    label="বাকি"
                    value={`৳ ${due.toLocaleString("bn-BD")}`}
                    strong
                  />
                </div>
              </div>

              {/* Signature */}
              <div className="px-6 pb-6 pt-2 grid grid-cols-2 gap-6 text-xs text-muted-foreground">
                <div className="text-center">
                  <div className="border-t mt-8 pt-1">কাস্টমারের স্বাক্ষর</div>
                </div>
                <div className="text-center">
                  <div className="border-t mt-8 pt-1">দোকানের স্বাক্ষর</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Saved list */}
          <aside className="no-print">
            <Card className="p-4">
              <h3 className="font-semibold mb-3">সেভ করা মেমো</h3>
              {saved.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  এখনো কিছু সেভ করা হয়নি।
                </p>
              ) : (
                <ul className="space-y-2 max-h-[70vh] overflow-auto">
                  {saved.map((s) => (
                    <li
                      key={s.id}
                      className="group rounded-md border p-3 hover:bg-accent/30 transition">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          className="text-left flex-1"
                          onClick={() => loadMemo(s)}>
                          <div className="font-medium text-sm">
                            {s.name || "—"}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            S/N {s.sn} ·{" "}
                            {new Date(s.createdAt).toLocaleDateString("bn-BD")}
                          </div>
                          <div className="text-xs mt-1">
                            মোট ৳
                            {s.items
                              .reduce((a, i) => a + i.qty * i.price, 0)
                              .toLocaleString("bn-BD")}
                          </div>
                        </button>
                        <button
                          onClick={() => deleteSaved(s.id)}
                          className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Home;

function Field({
  label,
  value,
  onChange,
  type = "text",
  readOnly,
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  type?: string;
  readOnly?: boolean;
}) {
  return (
    <div>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <Input
        type={type}
        value={value}
        readOnly={readOnly}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-1 h-9"
      />
    </div>
  );
}

function MField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2">
      <span className="font-bangla text-sm text-muted-foreground whitespace-nowrap">
        {label}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent text-right font-medium outline-none"
        placeholder="—"
      />
    </div>
  );
}

function Row({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between ${strong ? "text-base font-bold" : ""}`}>
      <span className={strong ? "" : "text-muted-foreground"}>{label}</span>
      <span>{value}</span>
    </div>
  );
}
