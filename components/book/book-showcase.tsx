import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/neo-brutalism/card";
import { IBook } from "@/types/interface";
import Image from "next/image";
import { motion } from "motion/react";
import { Dot, Hash, Layers } from "lucide-react";
import { Badge } from "../neo-brutalism/badge";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";

export default function BookShowcase({
  book,
  label,
}: {
  book: IBook;
  label: string;
}) {
  return (
    <Card className="w-full bg-main relative max-w-sm h-36 py-2">
      <CardHeader className="ml-26 flex flex-col -gap-2 text-black">
        <CardTitle className="font-semibold text-black font-pixel text-2xl tracking-wide">
          {book.title}
        </CardTitle>
        <CardDescription>
          {/* <div className="text-lg">{book.title}</div> */}
          {book.series !== null && book.series.length > 0 && (
            <motion.div
              className="mb-1 flex gap-1"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <span className="inline-flex items-center gap-1.5 text-xs  uppercase tracking-wider font-medium">
                <Layers size={11} />
                {book.series[0].name}
                {/* {book.seriesOrder && ` · Book ${book.seriesOrder}`} */}
              </span>
              {book.indexInSeries !== null && book.indexInSeries > 0 && (
                <>
                  <Dot />
                  <span className="inline-flex items-center gap-1.5 text-xs  uppercase tracking-wider font-medium">
                    BOOK {book.indexInSeries}
                  </span>
                </>
              )}
            </motion.div>
          )}
          <div className="flex flex-wrap gap-1">
            {book.genres.slice(0, 2).map((g) => (
              <Badge
                key={g}
                className="inline-flex bg-secondary-background text-foreground items-center gap-1 px-1 py-0.5 rounded-full  text-[10px]"
              >
                <Hash size={6} />
                {g}
              </Badge>
            ))}
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          className="absolute bottom-5 left-5 w-24 h-34 rounded-md "
          style={{
            boxShadow:
              "-20px 20px 40px rgba(0,0,0,0.5),-8px 12px 30px rgba(0,0,0,0.2), -3px 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <Image
            src={book.coverImage || "/placeholder-cover.png"}
            alt={book.title}
            fill
            sizes="14rem"
            className="object-cover rounded-xs"
            loading="eager"
            // sizes="40px"
          />
        </div>
      </CardContent>
    </Card>
  );
}
