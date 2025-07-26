export const formatDate = (date: string | Date): string => {
  try {
    // Handle both Date objects and string inputs
    const dateObj = typeof date === "string" ? new Date(date) : date

    // Check if the date is valid
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date"
    }

    return dateObj.toISOString().split("T")[0]
  } catch (error) {
    console.error("Error formatting date:", error)
    return "Invalid Date"
  }
}

export const isDateInRange = (date: string | Date, startDate: string | Date, endDate: string | Date): boolean => {
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date
    const startObj = typeof startDate === "string" ? new Date(startDate) : startDate
    const endObj = typeof endDate === "string" ? new Date(endDate) : endDate

    return dateObj >= startObj && dateObj <= endObj
  } catch (error) {
    console.error("Error checking date range:", error)
    return false
  }
}

export const getWeekRange = (date: Date): { start: Date; end: Date } => {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day + (day === 0 ? -6 : 1) // Adjust when day is Sunday
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7)
}

export const isSameDay = (date1: Date, date2: Date): boolean => {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  )
}

export const formatDateRange = (start: Date, end: Date): string => {
  const startStr = formatDate(start)
  const endStr = formatDate(end)
  return `${startStr} - ${endStr}`
}
