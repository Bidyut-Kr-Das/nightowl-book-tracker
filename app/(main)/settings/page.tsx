"use client";
import { Label } from "@/components/neo-brutalism/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/neo-brutalism/select";
import { useTheme } from "@/components/theme-provider";
import { THEMES, Theme } from "@/constants/themes";

export default function SettingPage() {
  const { theme, setTheme } = useTheme();
  return (
    <main className="w-full h-dvh ">
      <Label>Select Theme</Label>
      <Select
        onValueChange={(value: Theme) => {
          setTheme(value);
        }}
        defaultValue={theme}
      >
        <SelectTrigger className="w-80 capitalize bg-secondary-background text-foreground">
          <SelectValue placeholder="Select Theme" className="" />
        </SelectTrigger>
        <SelectContent className="bg-secondary-background  capitalize">
          <SelectGroup>
            {/* <SelectLabel>Fruits</SelectLabel> */}
            {THEMES.map((theme, idx) => (
              <SelectItem key={idx} className=" capitalize text-foreground" value={theme}>
                <div
                  className={`aspect-square h-2 bg-main rounded-full theme-${theme}`}
                ></div>
                {theme}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </main>
  );
}
