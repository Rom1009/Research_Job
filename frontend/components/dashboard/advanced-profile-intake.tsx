"use client";


import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  FieldGroup,
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FileText, Plus, X } from "lucide-react";


type Step = "basic" | "skills" | "preferences" | "review";


interface FormData {
  name: string;
  email: string;
  jobLevel: string | null;
  skills: string[];
  experience: number;
  availability: string | null;
  relocate: boolean;
  salary: [number, number];
  notes: string;
}


const SKILL_OPTIONS = [
  "TypeScript",
  "React",
  "Node.js",
  "Python",
  "Go",
  "Rust",
  "PostgreSQL",
  "MongoDB",
  "AWS",
  "Kubernetes",
  "Machine Learning",
  "DevOps",
];


export function AdvancedProfileIntake() {
  const [currentStep, setCurrentStep] = useState<Step>("basic");
  const [skillInput, setSkillInput] = useState("");
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    jobLevel: "mid",
    skills: [],
    experience: 5,
    availability: "immediate",
    relocate: false,
    salary: [120000, 180000],
    notes: "",
  });


  const stepIndex: Record<Step, number> = {
    basic: 0,
    skills: 1,
    preferences: 2,
    review: 3,
  };
  const progress = ((stepIndex[currentStep] + 1) / 4) * 100;


  const handleAddSkill = (skill: string) => {
    if (!formData.skills.includes(skill)) {
      setFormData({ ...formData, skills: [...formData.skills, skill] });
    }
  };


  const handleRemoveSkill = (skill: string) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((s) => s !== skill),
    });
  };


  const handleCustomSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      handleAddSkill(skillInput.trim());
      setSkillInput("");
    }
  };


  const handleNext = () => {
    const steps: Step[] = ["basic", "skills", "preferences", "review"];
    const currentIdx = steps.indexOf(currentStep);
    if (currentIdx < steps.length - 1) {
      setCurrentStep(steps[currentIdx + 1]);
    }
  };


  const handlePrev = () => {
    const steps: Step[] = ["basic", "skills", "preferences", "review"];
    const currentIdx = steps.indexOf(currentStep);
    if (currentIdx > 0) {
      setCurrentStep(steps[currentIdx - 1]);
    }
  };


  const handleSubmit = () => {
    if (!formData.name || !formData.email) {
      toast.error("Please fill in all required fields");
      return;
    }
    console.log("[v0] Submitting form:", formData);
    toast.success("Profile submitted successfully!");
  };


  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Enhanced Profile Intake</CardTitle>
        <CardDescription>
          Tell us about your ideal candidate profile
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">
              Step {stepIndex[currentStep] + 1} of 4
            </span>
            <span className="text-muted-foreground">
              {Math.round(progress)}%
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>


        {currentStep === "basic" && (
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="name">Candidate Name *</FieldLabel>
              <Input
                id="name"
                placeholder="Full name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </Field>


            <Field>
              <FieldLabel htmlFor="email">Email *</FieldLabel>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </Field>


            <Field>
              <FieldLabel htmlFor="level">Job Level</FieldLabel>


              <Select
                value={formData.jobLevel ?? ""}
                onValueChange={(v) => setFormData({ ...formData, jobLevel: v })}
              >
                <SelectTrigger id="level">
                  <SelectValue placeholder="Select job level" />
                </SelectTrigger>


                <SelectContent>
                  <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid-Level (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior (6-10 years)</SelectItem>
                  <SelectItem value="staff">Staff (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </FieldGroup>
        )}


        {currentStep === "skills" && (
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel>Required Skills</FieldLabel>
              <FieldDescription>
                Select or add skills for this role
              </FieldDescription>
              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom skill..."
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleCustomSkill()}
                  />
                  <Button
                    size="sm"
                    onClick={handleCustomSkill}
                    variant="outline"
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>


                <div className="flex flex-wrap gap-2">
                  {SKILL_OPTIONS.map((skill) => (
                    <Badge
                      key={skill}
                      variant={
                        formData.skills.includes(skill) ? "default" : "outline"
                      }
                      className="cursor-pointer"
                      onClick={() =>
                        formData.skills.includes(skill)
                          ? handleRemoveSkill(skill)
                          : handleAddSkill(skill)
                      }
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>


                {formData.skills.length > 0 && (
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-sm font-medium mb-2">
                      Selected ({formData.skills.length}):
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge
                          key={skill}
                          variant="secondary"
                          className="gap-1 cursor-pointer"
                          onClick={() => handleRemoveSkill(skill)}
                        >
                          {skill}
                          <X className="size-3" />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Field>


            <Field>
              <FieldLabel htmlFor="experience">
                Years of Experience: {formData.experience}
              </FieldLabel>


              <Slider
                id="experience"
                min={0}
                max={20}
                step={1}
                value={[formData.experience ?? 0]}
                onValueChange={(v) =>
                  setFormData({
                    ...formData,
                    experience: Array.isArray(v) ? v[0] : v,
                  })
                }
                className="mt-3"
              />
            </Field>
          </FieldGroup>
        )}


        {currentStep === "preferences" && (
          <FieldGroup className="space-y-4">
            <Field>
              <FieldLabel htmlFor="availability">Availability</FieldLabel>
              <Select
                value={formData.availability}
                onValueChange={(v) =>
                  setFormData({ ...formData, availability: v })
                }
              >
                <SelectTrigger id="availability">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="2weeks">2 Weeks Notice</SelectItem>
                  <SelectItem value="1month">1 Month Notice</SelectItem>
                  <SelectItem value="flexible">Flexible</SelectItem>
                </SelectContent>
              </Select>
            </Field>


            <Field>
              <div className="flex items-center gap-3">
                <Checkbox
                  id="relocate"
                  checked={formData.relocate}
                  onCheckedChange={(c) =>
                    setFormData({ ...formData, relocate: c as boolean })
                  }
                />
                <FieldLabel htmlFor="relocate" className="mb-0">
                  Open to relocation
                </FieldLabel>
              </div>
            </Field>


            <Field>
              <FieldLabel>Salary Range</FieldLabel>
              <div className="mt-3 space-y-2">
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Min</label>
                    <Input
                      type="number"
                      value={formData.salary[0]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: [
                            parseInt(e.target.value),
                            formData.salary[1],
                          ],
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm text-muted-foreground">Max</label>
                    <Input
                      type="number"
                      value={formData.salary[1]}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          salary: [
                            formData.salary[0],
                            parseInt(e.target.value),
                          ],
                        })
                      }
                      className="mt-1"
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  ${(formData.salary[0] / 1000).toFixed(0)}k - $
                  {(formData.salary[1] / 1000).toFixed(0)}k
                </p>
              </div>
            </Field>
          </FieldGroup>
        )}


        {currentStep === "review" && (
          <div className="space-y-4">
            <div className="rounded-lg bg-secondary/50 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{formData.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{formData.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Job Level</p>
                  <p className="font-medium capitalize">{formData.jobLevel}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Experience</p>
                  <p className="font-medium">{formData.experience} years</p>
                </div>
                <div className="col-span-2">
                  <p className="text-muted-foreground">
                    Skills ({formData.skills.length})
                  </p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.skills.map((s) => (
                      <Badge key={s} variant="secondary">
                        {s}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}


        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === "basic"}
          >
            Previous
          </Button>
          {currentStep === "review" ? (
            <Button onClick={handleSubmit} className="flex-1">
              Submit Profile
            </Button>
          ) : (
            <Button onClick={handleNext} className="flex-1">
              Next Step
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}