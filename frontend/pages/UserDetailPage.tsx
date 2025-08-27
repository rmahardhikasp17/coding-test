import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, MapPin, Building, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useUserStore } from "../stores";

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { currentUser, isLoading, fetchUserById, clearCurrentUser } = useUserStore();

  useEffect(() => {
    if (id) {
      fetchUserById(Number(id));
    }

    return () => clearCurrentUser();
  }, [id, fetchUserById, clearCurrentUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser && !isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive">User not found</p>
        <Link to="/currentUsers">
          <Button variant="outline" className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/currentUsers">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">User Details</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={currentUser.image} alt={currentUser.currentUsername} />
                <AvatarFallback>
                  {currentUser.firstName[0]}{currentUser.lastName[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">
                  {currentUser.firstName} {currentUser.lastName}
                </h3>
                <p className="text-muted-foreground">@{currentUser.currentUsername}</p>
                <Badge variant="secondary">{currentUser.role}</Badge>
              </div>
            </div>
            
            <div className="grid gap-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{currentUser.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{currentUser.phone}</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Age:</span>
                <p>{currentUser.age}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Gender:</span>
                <p>{currentUser.gender}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Birth Date:</span>
                <p>{new Date(currentUser.birthDate).toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Blood Group:</span>
                <p>{currentUser.bloodGroup}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p>{currentUser.address.address}</p>
                <p>{currentUser.address.city}, {currentUser.address.state} {currentUser.address.postalCode}</p>
                <p>{currentUser.address.country}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Company</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <Building className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium">{currentUser.company.name}</p>
                <p className="text-sm text-muted-foreground">{currentUser.company.title}</p>
                <p className="text-sm text-muted-foreground">{currentUser.company.department}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banking</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground mt-1" />
              <div>
                <p className="font-medium">{currentUser.bank.cardType}</p>
                <p className="text-sm text-muted-foreground">
                  **** **** **** {currentUser.bank.cardNumber.slice(-4)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Expires: {currentUser.bank.cardExpire}
                </p>
                <p className="text-sm text-muted-foreground">
                  Currency: {currentUser.bank.currency}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
