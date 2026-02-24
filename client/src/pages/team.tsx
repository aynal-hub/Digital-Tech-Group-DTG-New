import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SEOHead } from "@/components/seo-head";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import type { TeamMember } from "@shared/schema";

export default function Team() {
  const { data: members, isLoading } = useQuery<TeamMember[]>({ queryKey: ["/api/team"] });
  const activeMembers = members?.filter((m) => m.isActive) || [];

  return (
    <>
      <SEOHead title="Our Team - Digital Tech Group" description="Meet our talented team of professionals." />

      <section className="pt-32 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div className="text-center max-w-3xl mx-auto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Badge variant="secondary" className="mb-4">Our Team</Badge>
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Meet Our Experts</h1>
            <p className="text-muted-foreground text-lg">The talented people behind Digital Tech Group</p>
          </motion.div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map((i) => (<Card key={i}><CardContent className="p-6"><Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" /><Skeleton className="h-6 mx-auto w-32 mb-2" /><Skeleton className="h-4 mx-auto w-24" /></CardContent></Card>))}
            </div>
          ) : activeMembers.length === 0 ? (
            <div className="text-center py-16"><p className="text-muted-foreground">No team members to display.</p></div>
          ) : (
            <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
              {activeMembers.map((member, i) => (
                <motion.div key={member.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Card className="text-center hover-elevate" data-testid={`card-team-${member.id}`}>
                    <CardContent className="p-6 space-y-4">
                      <Avatar className="w-24 h-24 mx-auto">
                        {member.avatarUrl && <img src={member.avatarUrl} alt={member.name} className="w-full h-full object-cover" />}
                        <AvatarFallback className="text-xl">{member.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-lg">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.designation}</p>
                        {member.isFounder && <Badge className="mt-2">Founder & CEO</Badge>}
                      </div>
                      {member.bio && <p className="text-sm text-muted-foreground line-clamp-3">{member.bio}</p>}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
