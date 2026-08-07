import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OSShell } from "./OSShell";

describe("OSShell", () => {
  it("renders the top bar wordmark, status, and children", () => {
    render(
      <OSShell>
        <p>page content</p>
      </OSShell>
    );
    expect(screen.getByText("KEYUSH PATEL")).toBeInTheDocument();
    expect(screen.getByText("Start a Project")).toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("shows the stylized in-universe domain in the system status widget", () => {
    render(
      <OSShell>
        <p>page content</p>
      </OSShell>
    );
    expect(screen.getByText("orbitos.keyush")).toBeInTheDocument();
  });

  it("opens the command palette on the button click and filters commands", async () => {
    const user = userEvent.setup();
    render(
      <OSShell>
        <p>page content</p>
      </OSShell>
    );
    await user.click(screen.getByLabelText("Open command palette"));
    expect(screen.getByPlaceholderText("Type a command...")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Type a command..."), "github");
    expect(screen.getByText("Open GitHub")).toBeInTheDocument();
    expect(screen.queryByText("Read about me")).not.toBeInTheDocument();
  });
});
