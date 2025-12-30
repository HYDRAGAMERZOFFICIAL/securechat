"use client";

import { ArrowLeft, Laptop, MoreVertical, QrCode, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { ScrollArea } from "./ui/scroll-area";

export function LinkedDevicesView({ onClose }: { onClose: () => void; }) {
  const linkedDevices = [
    { type: 'desktop', name: 'MacOS', location: 'San Francisco, US', lastActive: 'now', isCurrent: true },
    { type: 'mobile', name: 'Pixel 8 Pro', location: 'San Francisco, US', lastActive: '2 hours ago', isCurrent: false },
  ];

  return (
    <div className="flex flex-col h-full">
      <header className="p-3 border-b border-border flex items-center bg-card">
        <Button variant="ghost" size="icon" className="mr-2" onClick={onClose}>
          <ArrowLeft />
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Linked Devices</h2>
          <p className="text-sm text-muted-foreground">Manage your connected devices</p>
        </div>
      </header>
      
      <div className="p-6 text-center border-b">
        <div className="flex justify-center mb-4">
          <QrCode className="h-24 w-24 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold">Link a new device</h3>
        <p className="text-sm text-muted-foreground mb-4">Scan this code with your phone to log in instantly.</p>
        <Button>Link a Device</Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          <h4 className="text-sm font-semibold text-muted-foreground px-2">Device List</h4>
          {linkedDevices.map((device, index) => (
            <div key={index} className="flex items-center gap-4 p-2 rounded-lg hover:bg-muted">
              {device.type === 'desktop' ? <Laptop className="h-8 w-8 text-muted-foreground" /> : <Smartphone className="h-8 w-8 text-muted-foreground" />}
              <div className="flex-1">
                <h3 className="font-semibold">{device.name}</h3>
                <p className="text-sm text-muted-foreground">{device.location} &bull; {device.isCurrent ? <span className="text-green-500">Active now</span> : `Last active ${device.lastActive}`}</p>
              </div>
              {!device.isCurrent && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-destructive">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
