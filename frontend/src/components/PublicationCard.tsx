import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Publication {
  id: number;
  name: string;
  description: string;
  author: string;
  date: string;
  category: string;
}

interface PublicationCardProps {
  publication: Publication;
}

const PublicationCard = ({ publication }: PublicationCardProps) => {
  return (
    <Card className="h-full transition-shadow hover:shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-xl">{publication.name}</CardTitle>
          <Badge variant="secondary">{publication.category}</Badge>
        </div>
        <CardDescription>by {publication.author}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-3 text-sm text-muted-foreground">{publication.description}</p>
        <p className="text-xs text-muted-foreground">{publication.date}</p>
      </CardContent>
    </Card>
  );
};

export default PublicationCard;
