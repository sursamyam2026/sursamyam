import { CalendarIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface EventDateTimePickerProps {
  date: string;
  time: string;
  onDateChange: (date: string) => void;
  onTimeChange: (time: string) => void;
}

const timeOptions = Array.from({ length: 96 }, (_, index) => {
  const minutes = index * 15;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  const value = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  const label = new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(`2026-01-01T${value}:00`));

  return { value, label };
});

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDate(value: string): string {
  const date = parseDate(value);
  if (!date) return "Select date";

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string): string {
  return timeOptions.find((option) => option.value === value)?.label ?? "Select time";
}

const EventDateTimePicker = ({
  date,
  time,
  onDateChange,
  onTimeChange,
}: EventDateTimePickerProps) => {
  return (
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_150px]">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-11 justify-start border-[#C9922A] bg-white px-3 text-left font-normal text-[#1B4D3E]",
              !date && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[#C9922A]" />
            {formatDate(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto border-[#E8D5A3] bg-[#FDF6EC] p-0" align="start">
          <Calendar
            mode="single"
            selected={parseDate(date)}
            onSelect={(nextDate) => {
              if (nextDate) onDateChange(toDateKey(nextDate));
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      <Select value={time} onValueChange={onTimeChange}>
        <SelectTrigger className="h-11 border-[#C9922A] bg-white text-[#1B4D3E]">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-[#C9922A]" />
            <SelectValue placeholder="Time">{time ? formatTime(time) : "Time"}</SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="max-h-72 border-[#E8D5A3] bg-[#FDF6EC] text-[#1B4D3E]">
          {timeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default EventDateTimePicker;
