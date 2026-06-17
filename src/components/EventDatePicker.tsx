import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EventDatePickerProps {
  value: string;
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
  maxDate?: string;
}

function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatDate(value: string, placeholder: string): string {
  const date = parseDate(value);
  if (!date) return placeholder;

  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

const EventDatePicker = ({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
  maxDate,
}: EventDatePickerProps) => {
  const min = parseDate(minDate);
  const max = parseDate(maxDate);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-11 w-full justify-start border-[#C9922A] bg-white px-3 text-left font-normal text-[#1B4D3E]",
            !value && "text-muted-foreground",
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4 text-[#C9922A]" />
          {formatDate(value, placeholder)}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto border-[#E8D5A3] bg-[#FDF6EC] p-0" align="start">
        <Calendar
          mode="single"
          selected={parseDate(value)}
          disabled={(date) => {
            if (min && date < min) return true;
            if (max && date > max) return true;
            return false;
          }}
          onSelect={(nextDate) => {
            if (nextDate) onChange(toDateKey(nextDate));
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};

export default EventDatePicker;
