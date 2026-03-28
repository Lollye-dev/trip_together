export type StepAdd = {
  trip_id: number;
  city: string;
  country: string;
  image_url: string;
};

export type AddStepProps = {
  onStepAdded: () => void;
};

export type Libraries = ("drawing" | "geometry" | "places" | "visualization")[];