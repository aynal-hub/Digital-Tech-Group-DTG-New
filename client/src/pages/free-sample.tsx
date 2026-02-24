import { motion } from "framer-motion";
import { Gift, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SEOHead } from "@/components/seo-head";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { Link } from "wouter";
import type { Service } from "@shared/schema";

const sampleSchema = z.object({
  fullName: z.string().min(1, "Name is required").max(100),
  phone: z.string().min(1, "Phone is required").max(20),
  country: z.string().min(1, "Country is required").max(100),
  serviceId: z.number({ required_error: "Select a service" }),
  requirements: z.string().min(1, "Requirements are required").max(2000),
});

type SampleFormData = z.infer<typeof sampleSchema>;

export default function FreeSample() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);
  const { data: services } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const form = useForm<SampleFormData>({
    resolver: zodResolver(sampleSchema),
    defaultValues: { fullName: "", phone: "", country: "", requirements: "" },
  });

  const mutation = useMutation({
    mutationFn: async (data: SampleFormData) => {
      await apiRequest("POST", "/api/sample-request", data);
    },
    onSuccess: () => {
      toast({ title: "Request Submitted!", description: "We'll review your request soon." });
      setSubmitted(true);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit. Please try again.", variant: "destructive" });
    },
  });

  if (submitted) {
    return (
      <>
        <SEOHead title="Request Submitted - Digital Tech Group" />
        <section className="pt-32 pb-20 min-h-screen flex items-center">
          <div className="max-w-md mx-auto px-4 text-center space-y-6">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Gift className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">Request Submitted!</h1>
            <p className="text-muted-foreground">Thank you for your interest. We'll review your request and get back to you shortly.</p>
            <Link href="/services"><Button>Explore Our Services</Button></Link>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      <SEOHead title="Free Sample Request - Digital Tech Group" description="Request a free sample of our services." />

      <section className="pt-32 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Free Sample</Badge>
            <h1 className="text-4xl font-bold mb-4">Request a Free Sample</h1>
            <p className="text-muted-foreground">Try our services risk-free before making a commitment</p>
          </motion.div>

          <Card>
            <CardContent className="p-6">
              <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input id="fullName" placeholder="Your full name" {...form.register("fullName")} data-testid="input-sample-name" />
                  {form.formState.errors.fullName && <p className="text-xs text-destructive">{form.formState.errors.fullName.message}</p>}
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+1234567890" {...form.register("phone")} data-testid="input-sample-phone" />
                    {form.formState.errors.phone && <p className="text-xs text-destructive">{form.formState.errors.phone.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Input id="country" placeholder="Your country" {...form.register("country")} data-testid="input-sample-country" />
                    {form.formState.errors.country && <p className="text-xs text-destructive">{form.formState.errors.country.message}</p>}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Service</Label>
                  <Controller
                    name="serviceId"
                    control={form.control}
                    render={({ field }) => (
                      <Select onValueChange={(v) => field.onChange(parseInt(v))} value={field.value?.toString()}>
                        <SelectTrigger data-testid="select-sample-service"><SelectValue placeholder="Select a service" /></SelectTrigger>
                        <SelectContent>
                          {services?.filter((s) => s.isActive).map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.serviceId && <p className="text-xs text-destructive">{form.formState.errors.serviceId.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requirements">Detailed Requirements</Label>
                  <Textarea id="requirements" placeholder="Describe what you need..." rows={5} {...form.register("requirements")} data-testid="input-sample-requirements" />
                  {form.formState.errors.requirements && <p className="text-xs text-destructive">{form.formState.errors.requirements.message}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={mutation.isPending} data-testid="button-submit-sample">
                  {mutation.isPending ? "Submitting..." : "Submit Request"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>
    </>
  );
}
