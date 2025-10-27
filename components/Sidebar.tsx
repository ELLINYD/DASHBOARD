"use client";

import Link from "next/link";
import { NAV, NavNode } from "@/src/config/nav";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

function Leaf({ node }: { node: NavNode }) {
  return (
    <Link href={node.href!} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50">
      {node.icon ? <node.icon className="h-4 w-4" /> : null}
      <span className="flex-1 truncate">{node.label}</span>
      {node.comingSoon ? <Badge variant="outline">Coming soon</Badge> : null}
    </Link>
  );
}

function Branch({ node, level = 0 }: { node: NavNode; level?: number }) {
  const [open, setOpen] = useState(true);
  return (
    <div className={level === 0 ? "mb-1" : "ml-3"}>
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted/50"
      >
        <span className="flex-1 text-left font-medium">{node.label}</span>
        <ChevronDown className={`h-4 w-4 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="mt-1">
          {node.children!.map((child) =>
            child.children ? (
              <Branch key={child.label} node={child} level={level + 1} />
            ) : (
              <Leaf key={child.label} node={child} />
            )
          )}
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="w-64 border-r bg-background">
      <div className="p-3 space-y-1">
        {NAV.map((node) =>
          node.children ? <Branch key={node.label} node={node} /> : <Leaf key={node.label} node={node} />
        )}
      </div>
    </aside>
  );
}
