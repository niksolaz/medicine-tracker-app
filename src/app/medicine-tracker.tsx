'use client'

import { useState, useEffect } from 'react'
import { format, isPast, addDays } from 'date-fns'
import { Plus, AlertTriangle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

interface Medicine {
  id: number
  name: string
  expiryDate: Date
  notified: boolean
  warningNotified: boolean
}

export default function MedicineTracker() {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [newMedicine, setNewMedicine] = useState({ name: '', expiryDate: '' })
  const { toast } = useToast()

  useEffect(() => {
    const checkExpiry = () => {
      const today = new Date()
      medicines.forEach(medicine => {
        if (isPast(medicine.expiryDate) && !medicine.notified) {
          toast({
            title: "Medicine Expired!",
            description: `${medicine.name} has expired on ${format(medicine.expiryDate, 'PP')}.`,
            variant: "destructive",
          })
          // Mark as notified to prevent repeated notifications
          setMedicines(prev => prev.map(m => m.id === medicine.id ? { ...m, notified: true } : m))
        } else if (isPast(addDays(medicine.expiryDate, -7)) && !medicine.warningNotified) {
          toast({
            title: "Medicine Expiring Soon!",
            description: `${medicine.name} will expire on ${format(medicine.expiryDate, 'PP')}.`,
            variant: "default",
          })
          // Mark as warning notified
          setMedicines(prev => prev.map(m => m.id === medicine.id ? { ...m, warningNotified: true } : m))
        }
      })
    }

    checkExpiry()
    const interval = setInterval(checkExpiry, 86400000) // Check every 24 hours

    return () => clearInterval(interval)
  }, [medicines, toast])

  const handleAddMedicine = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMedicine.name && newMedicine.expiryDate) {
      setMedicines([...medicines, { 
        id: Date.now(), 
        name: newMedicine.name, 
        expiryDate: new Date(newMedicine.expiryDate),
        notified: false,
        warningNotified: false
      }])
      setNewMedicine({ name: '', expiryDate: '' })
    }
  }

  const handleRemoveMedicine = (id: number) => {
    setMedicines(medicines.filter(medicine => medicine.id !== id))
  }

  return (
    <ToastProvider>
      <ToastViewport />
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Medicine Expiry Tracker</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Add New Medicine</CardTitle>
            <CardDescription>Enter the details of the new medicine</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddMedicine} className="space-y-4">
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name"
                    value={newMedicine.name}
                    onChange={(e) => setNewMedicine({...newMedicine, name: e.target.value})}
                    placeholder="Medicine name"
                  />
                </div>
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input 
                    id="expiryDate"
                    type="date"
                    value={newMedicine.expiryDate}
                    onChange={(e) => setNewMedicine({...newMedicine, expiryDate: e.target.value})}
                  />
                </div>
              </div>
            </form>
          </CardContent>
          <CardFooter>
            <Button onClick={handleAddMedicine}>
              <Plus className="mr-2 h-4 w-4" /> Add Medicine
            </Button>
          </CardFooter>
        </Card>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {medicines.map(medicine => (
            <Card key={medicine.id} className={isPast(medicine.expiryDate) ? "border-red-500" : ""}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {medicine.name}
                  {isPast(medicine.expiryDate) && <AlertTriangle className="h-5 w-5 text-red-500" />}
                </CardTitle>
                <CardDescription>
                  Expires on: {format(medicine.expiryDate, 'PP')}
                </CardDescription>
              </CardHeader>
              <CardFooter>
                <Button variant="destructive" onClick={() => handleRemoveMedicine(medicine.id)}>Remove</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </ToastProvider>
  )
}
