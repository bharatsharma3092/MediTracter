import { Input } from './Input'

export function SearchBar({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <Input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search inventory"
      aria-label="Search inventory"
      className="w-full"
    />
  )
}
