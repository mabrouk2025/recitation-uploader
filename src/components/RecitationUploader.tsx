import React, { useState, useRef, ChangeEvent } from 'react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Check, X, UploadCloud, Music, FileAudio, Mic } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import TagInput from './TagInput';
import AudioPlayer from './AudioPlayer';
interface RecitationUploaderProps {
  className?: string;
}
type RecitationType = 'tajweed' | 'tarteel' | 'tahqeeq';
type BackgroundType = 'none' | 'color' | 'image';
const ACCEPTED_FILE_TYPES = ['audio/mpeg', 'audio/mp3'];
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

const RecitationUploader = ({
  className
}: RecitationUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [reciter, setReciter] = useState('');
  const [recitationType, setRecitationType] = useState<RecitationType>('tarteel');
  const [tags, setTags] = useState<string[]>([]);
  const [enableRepeat, setEnableRepeat] = useState(false);
  const [showTafseer, setShowTafseer] = useState(false);
  const [background, setBackground] = useState<BackgroundType>('none');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };
  const validateAndSetFile = (file: File) => {
    if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
      toast({
        title: "خطأ في نوع الملف",
        description: "يرجى رفع ملف بصيغة MP3 فقط",
        variant: "destructive"
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "حجم الملف كبير جداً",
        description: "يجب أن يكون حجم الملف أقل من 20 ميجابايت",
        variant: "destructive"
      });
      return;
    }
    setFile(file);
    setAudioUrl(URL.createObjectURL(file));
  };
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };
  const clearFile = () => {
    setFile(null);
    setAudioUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  const handleUpload = () => {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    setTimeout(() => {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(100);
      toast({
        title: "تم رفع التلاوة بنجاح!",
        description: "يمكنك الآن الاستماع للتلاوة من صفحة التلاوات"
      });
      setTimeout(() => {
        setFile(null);
        setAudioUrl('');
        setTitle('');
        setDescription('');
        setReciter('');
        setRecitationType('tarteel');
        setTags([]);
        setEnableRepeat(false);
        setShowTafseer(false);
        setBackground('none');
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 1500);
    }, 3000);
  };
  const isFormValid = !!file && !!title && !!reciter;
  return <div className={cn("max-w-4xl mx-auto p-6", className)}>
      <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      duration: 0.5
    }} className="mb-6 text-center">
        <h1 className="text-3xl font-bold mb-2">رفع تلاوة جديدة</h1>
        <p className="text-muted-foreground">قم برفع تلاوتك وشاركها مع المجتمع</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <motion.div initial={{
        opacity: 0,
        x: -20
      }} animate={{
        opacity: 1,
        x: 0
      }} transition={{
        duration: 0.5,
        delay: 0.1
      }} className="md:col-span-1">
          <Card className="h-full">
            <CardContent className="pt-6 flex flex-col h-full">
              <div className={cn("border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all mb-4", dragActive ? "border-primary bg-primary/5" : "border-muted")} onDragEnter={handleDrag} onDragOver={handleDrag} onDragLeave={handleDrag} onDrop={handleDrop}>
                {!file ? <>
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <UploadCloud className="text-primary h-8 w-8" />
                    </div>
                    <p className="text-center mb-2">اسحب ملف التلاوة هنا</p>
                    <p className="text-xs text-muted-foreground text-center mb-4">أو</p>
                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                      اختر ملفاً
                    </Button>
                    <input ref={fileInputRef} type="file" accept=".mp3,audio/mpeg" onChange={handleFileChange} className="hidden" />
                    <p className="text-xs text-muted-foreground mt-4">
                      يجب أن يكون الملف بصيغة MP3، بحجم أقصى 20 ميجابايت
                    </p>
                  </> : <div className="w-full">
                    <div className="flex items-center mb-4">
                      <FileAudio className="text-primary h-6 w-6 mr-2" />
                      <div className="flex-1 truncate">{file.name}</div>
                      <button onClick={clearFile} className="p-1 rounded-full hover:bg-muted transition-colors" aria-label="Remove file">
                        <X size={16} />
                      </button>
                    </div>
                    {audioUrl && <AudioPlayer src={audioUrl} />}
                  </div>}
              </div>

              {isUploading && <div className="mt-auto pt-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span>جاري الرفع...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{
                  width: `${uploadProgress}%`
                }}></div>
                  </div>
                </div>}
              
              {uploadProgress === 100 && !isUploading && <div className="flex items-center justify-center text-green-600 mt-auto pt-4">
                  <Check className="mr-2" size={16} />
                  <span>تم الرفع بنجاح!</span>
                </div>}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.5,
        delay: 0.2
      }} className="md:col-span-2">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان التلاوة</Label>
                  <Input id="title" dir="rtl" value={title} onChange={e => setTitle(e.target.value)} placeholder="أدخل عنوان التلاوة" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">وصف التلاوة</Label>
                  <Textarea id="description" dir="rtl" value={description} onChange={e => setDescription(e.target.value)} placeholder="أدخل وصفاً مختصراً للتلاوة (اختياري)" className="min-h-[100px]" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reciter">اسم القارئ</Label>
                  <Input id="reciter" dir="rtl" value={reciter} onChange={e => setReciter(e.target.value)} placeholder="أدخل اسم القارئ" />
                </div>
                
                <div className="space-y-2">
                  <Label>نوع التلاوة</Label>
                  <RadioGroup value={recitationType} onValueChange={value => setRecitationType(value as RecitationType)} className="flex flex-row justify-around">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="tajweed" id="tajweed" />
                      <Label htmlFor="tajweed" className="mr-2 cursor-pointer">مجود</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="tarteel" id="tarteel" />
                      <Label htmlFor="tarteel" className="mr-2 cursor-pointer">مرتل </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="tahqeeq" id="tahqeeq" />
                      <Label htmlFor="tahqeeq" className="mr-2 cursor-pointer">تحقيق </Label>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tags">الوسوم (Tags)</Label>
                  <TagInput value={tags} onChange={setTags} placeholder="أضف وسوماً مثل: خشوع، تجويد..." maxTags={5} />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  
                  <div className="flex items-center justify-between space-x-2">
                    <Label htmlFor="tafseer" className="cursor-pointer">إظهار التفسير</Label>
                    <Switch id="tafseer" checked={showTafseer} onCheckedChange={setShowTafseer} />
                  </div>
                  
                  
                </div>
                
                <Button className="w-full" disabled={!isFormValid || isUploading} onClick={handleUpload}>
                  {isUploading ? 'جاري الرفع...' : 'رفع التلاوة'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>;
};
export default RecitationUploader;