import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverTitle,
  Page,
} from "../src/index";

const meta = { title: "Shared/Controls" } satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;
export const Buttons: Story = {
  render: () => (
    <div className="flex gap-2">
      <Button>Save</Button>
      <Button variant="outline">Cancel</Button>
      <Button disabled>Unavailable</Button>
    </div>
  ),
};
export const Cards: Story = {
  render: () => (
    <Card>
      <CardHeader>
        <CardTitle>Example session</CardTitle>
        <CardDescription>Fictional component content</CardDescription>
      </CardHeader>
      <CardContent>Easy cycling</CardContent>
    </Card>
  ),
};
export const Dialogs: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button />}>Open dialog</DialogTrigger>
      <DialogContent>
        <DialogTitle>Example dialog</DialogTitle>
        <DialogDescription>Fictional component content</DialogDescription>
      </DialogContent>
    </Dialog>
  ),
};
export const Popovers: Story = {
  render: () => (
    <Popover>
      <PopoverTrigger render={<Button variant="outline" />}>Open popover</PopoverTrigger>
      <PopoverContent>
        <PopoverTitle>Example popover</PopoverTitle>
        <Button>Choose</Button>
      </PopoverContent>
    </Popover>
  ),
};
export const Pages: Story = {
  render: () => (
    <Page title="Example page" subtitle="Fictional content" action={<Button>Save</Button>}>
      <p>Caller-owned page content</p>
    </Page>
  ),
};
