import { createRoot } from "react-dom/client";
import {
  Button,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  Page,
  InlineConfirmation,
  PALETTES,
  applyPalette,
  paletteById,
} from "@enduragent/ui";
import "./style.css";

const root = document.getElementById("root");
if (!root) throw Error("Missing consumer root");
const days = [
  { value: "mon", label: "Monday" },
  { value: "wed", label: "Wednesday" },
];
createRoot(root).render(
  <main className="p-9 grid gap-5">
    <Button>Library button</Button>
    <Button className="h-ctl-lg bg-surface text-ink" variant="default">
      Consumer override
    </Button>
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Portaled content</PopoverTitle>
        <Button>Portal action</Button>
      </PopoverContent>
    </Popover>
    <Dialog>
      <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogTitle>Example dialog</DialogTitle>
        <DialogDescription>Fictional dialog content</DialogDescription>
      </DialogContent>
    </Dialog>
    <Select items={days} defaultValue="wed">
      <SelectTrigger aria-label="Training day">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {days.map((day) => (
          <SelectItem key={day.value} value={day.value}>
            {day.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
    <Card>
      <CardHeader>
        <CardTitle>Example card</CardTitle>
      </CardHeader>
      <CardContent>Fictional card content</CardContent>
    </Card>
    <Page title="Example page">
      <p>Fictional page content</p>
    </Page>
    <InlineConfirmation
      name="fictional-confirmation"
      title="Remove example?"
      copy="This clears the fictional example."
      confirmLabel="Remove example"
      focusTarget={null}
      onCancel={() => {}}
      onConfirm={() => {}}
    />
    <div className="flex flex-wrap gap-2">
      {PALETTES.map((palette) => (
        <Button
          key={palette.id}
          data-palette={palette.id}
          onClick={() =>
            applyPalette({
              root: document.documentElement,
              palette,
              appearance:
                document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light",
            })
          }
        >
          {palette.name}
        </Button>
      ))}
    </div>
    <Button
      onClick={() =>
        applyPalette({
          root: document.documentElement,
          palette: paletteById("patrol"),
          appearance: "dark",
        })
      }
    >
      Dark theme
    </Button>
    <code className="font-mono">Fictional example</code>
  </main>,
);
