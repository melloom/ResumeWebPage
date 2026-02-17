import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FileArchive, Upload, X } from 'lucide-react';
import { Button } from '@code-review/components/ui/button';
import { Card, CardContent } from '@code-review/components/ui/card';
import { useToast } from '@code-review/hooks/use-toast';
import { AnalysisResult } from '@code-review/lib/analyzer-enhanced';
import { ExtendedAnalysisResult } from '@code-review/lib/extended-types';

interface FileUploadProps {
  onFilesAnalyzed: (result: ExtendedAnalysisResult & { source: 'upload'; name: string; totalFiles: number }) => void;
  disabled?: boolean;
}

export function FileUpload({ onFilesAnalyzed, disabled }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

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

    if (disabled) return;

    const droppedFiles = [...e.dataTransfer.files];
    handleFiles(droppedFiles);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles([...e.target.files]);
    }
  };

  const handleFiles = (newFiles: File[]) => {
    // Filter for supported file types
    const supportedTypes = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt'];
    const validFiles = newFiles.filter(file => {
      const ext = '.' + file.name.split('.').pop()?.toLowerCase();
      return supportedTypes.includes(ext) || file.name.toLowerCase().endsWith('.zip');
    });

    if (validFiles.length === 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload code files or a ZIP archive",
        variant: "destructive",
      });
      return;
    }

    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const analyzeFiles = async () => {
    if (files.length === 0) return;

    // If there's a ZIP file, handle it specially
    const zipFile = files.find(f => f.name.toLowerCase().endsWith('.zip'));
    
    if (zipFile) {
      try {
        // Read ZIP file and extract contents
        const zipContent = await zipFile.arrayBuffer();
        const JSZip = await import('jszip');
        const zip = await JSZip.loadAsync(zipContent);
        
        const extractedFiles: GitHubFile[] = [];
        
        zip.forEach(async (relativePath, file) => {
          // Skip directories and hidden files
          if (file.dir || relativePath.startsWith('.')) return;
          
          // Check if file has supported extension
          const ext = '.' + relativePath.split('.').pop()?.toLowerCase();
          const supportedTypes = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.swift', '.kt'];
          
          if (supportedTypes.includes(ext)) {
            const content = await zip.file(relativePath).async('string');
            extractedFiles.push({
              name: relativePath,
              content,
              path: relativePath,
              type: 'file' as const,
              sha: 'zip-' + relativePath,
              size: content.length
            });
          }
        });
        
        if (extractedFiles.length === 0) {
          toast({
            title: "No valid files found",
            description: "The ZIP file doesn't contain any supported code files",
            variant: "destructive",
          });
          return;
        }
        
        // Replace the files array with extracted files
        setFiles([]);
        
        // Analyze extracted files
        const fileContents = extractedFiles;
        
        try {
          // Import here to avoid circular dependency
          const { enhancedCodeAnalyzer } = await import('@code-review/lib/analyzer-enhanced');
          const result = await enhancedCodeAnalyzer.analyzeFilesStreaming(fileContents);
          
          onFilesAnalyzed({
            ...result,
            source: 'upload' as const,
            name: zipFile.name.replace('.zip', ''),
            totalFiles: extractedFiles.length,
          } as ExtendedAnalysisResult & { source: 'upload'; name: string; totalFiles: number });

          toast({
            title: "Analysis complete!",
            description: `Analyzed ${extractedFiles.length} files from ${zipFile.name}`,
          });
        } catch (error) {
          toast({
            title: "Analysis failed",
            description: error instanceof Error ? error.message : "Failed to analyze extracted files",
            variant: "destructive",
          });
        }
        
      } catch (error) {
        toast({
          title: "ZIP extraction failed",
          description: error instanceof Error ? error.message : "Failed to extract ZIP file",
          variant: "destructive",
        });
      }
      return;
    }

    // Read all files and analyze
    const fileContents = await Promise.all(
      files.map(async (file) => {
        const content = await file.text();
        return {
          name: file.name,
          content,
          path: file.name,
          type: 'file' as const,
          sha: 'local-' + file.name,
          size: file.size
        };
      })
    );

    try {
      // Import here to avoid circular dependency
      const { enhancedCodeAnalyzer } = await import('@code-review/lib/analyzer-enhanced');
      const result = await enhancedCodeAnalyzer.analyzeFilesStreaming(fileContents);
      
      onFilesAnalyzed({
        ...result,
        source: 'upload' as const,
        name: 'Uploaded Files',
        totalFiles: files.length,
      } as ExtendedAnalysisResult & { source: 'upload'; name: string; totalFiles: number });

      toast({
        title: "Analysis complete!",
        description: `Analyzed ${files.length} files`,
      });

      // Clear files after successful analysis
      setFiles([]);
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze files",
        variant: "destructive",
      });
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="glass-card">
      <CardContent className="p-6">
        <motion.div
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive 
              ? 'border-primary bg-primary/5' 
              : 'border-border/50 bg-secondary/30'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/40'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          whileHover={{ scale: disabled ? 1 : 1.01 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".ts,.tsx,.js,.jsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.zip"
            onChange={handleChange}
            className="hidden"
            disabled={disabled}
          />
          
          <FileArchive className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="font-medium mb-2">
            {dragActive ? 'Drop files here' : 'Drop files here or click to browse'}
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Supports .ts, .tsx, .js, .jsx, .py, .java, .cpp, .c, .cs, .php, .rb, .go, .rs, .swift, .kt, .zip
          </p>
          <Button 
            variant="outline" 
            onClick={openFileDialog}
            disabled={disabled}
            className="gap-2"
          >
            <Upload className="h-4 w-4" /> Browse Files
          </Button>
        </motion.div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="font-medium">Selected Files:</h4>
            {files.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 border rounded-lg"
              >
                <span className="text-sm truncate flex-1">{file.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={analyzeFiles}
              disabled={disabled || files.length === 0}
              className="w-full mt-2"
            >
              Analyze Files
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
